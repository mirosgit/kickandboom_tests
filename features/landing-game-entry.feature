@smoke @landing @game-entry
Feature: KickAndBoom landing and game entry
  As a visitor
  I want to open the KickAndBoom landing page
  So that I can start the game flow

  Scenario: Visitor starts the Play flow from the landing page
    Given I open the KickAndBoom landing page
    Then the landing page is ready to start the game
    When I start the Play flow
    Then the game entry flow should be opened
    And the game canvas should expose WebGL when available
    And there should be no blocking runtime issues
