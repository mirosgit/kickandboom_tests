import type { ConsoleMessage, Page, Request, Response } from '@playwright/test';

type RuntimeIssueType = 'console-error' | 'page-error' | 'request-failed' | 'server-error';

export type RuntimeIssue = {
  type: RuntimeIssueType;
  message: string;
  url?: string;
  status?: number;
};

const MONITORED_RESOURCE_TYPES = new Set([
  'document',
  'script',
  'xhr',
  'fetch',
  'websocket'
]);

export class RuntimeMonitor {
  private readonly attachedPages = new WeakSet<Page>();
  private readonly issues: RuntimeIssue[] = [];

  attach(page: Page): void {
    if (this.attachedPages.has(page)) {
      return;
    }

    this.attachedPages.add(page);
    page.on('console', (message) => this.captureConsoleError(message));
    page.on('pageerror', (error) => {
      this.issues.push({
        type: 'page-error',
        message: error.message
      });
    });
    page.on('requestfailed', (request) => this.captureFailedRequest(request));
    page.on('response', (response) => this.captureServerError(response));
  }

  getIssues(): RuntimeIssue[] {
    return [...this.issues];
  }

  getBlockingIssues(): RuntimeIssue[] {
    return this.issues.filter((issue) => !isIgnoredIssue(issue));
  }

  private captureConsoleError(message: ConsoleMessage): void {
    if (message.type() !== 'error') {
      return;
    }

    this.issues.push({
      type: 'console-error',
      message: message.text(),
      url: message.location().url
    });
  }

  private captureFailedRequest(request: Request): void {
    if (!MONITORED_RESOURCE_TYPES.has(request.resourceType())) {
      return;
    }

    this.issues.push({
      type: 'request-failed',
      message: request.failure()?.errorText ?? 'Request failed',
      url: request.url()
    });
  }

  private captureServerError(response: Response): void {
    if (response.status() < 500 || !MONITORED_RESOURCE_TYPES.has(response.request().resourceType())) {
      return;
    }

    this.issues.push({
      type: 'server-error',
      message: response.statusText(),
      status: response.status(),
      url: response.url()
    });
  }
}

function isBenignConsoleError(message: string): boolean {
  return [
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured'
  ].some((knownMessage) => message.includes(knownMessage));
}


function isIgnoredIssue(issue: RuntimeIssue): boolean {
  if (issue.type === 'console-error') {
    return isBenignConsoleError(issue.message);
  }

  if (issue.type === 'request-failed') {
    return isThirdPartyAnalyticsAbort(issue);
  }

  return false;
}

function isThirdPartyAnalyticsAbort(issue: RuntimeIssue): boolean {
  if (!issue.url || !issue.message.includes('ERR_ABORTED')) {
    return false;
  }

  return [
    'google-analytics.com',
    'googletagmanager.com',
    'doubleclick.net'
  ].some((host) => issue.url?.includes(host));
}
