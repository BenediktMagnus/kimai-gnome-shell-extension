#!/usr/bin/env gjs

'use strict';

// External imports:
const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;

// Internal imports:
const ThisExtension = ExtensionUtils.getCurrentExtension();
/** @type {import('./utility/constants')} */
const Constants = ThisExtension.imports.utility.constants;
/** @type {import('./kimai/api')} */
const KimaiApi = ThisExtension.imports.kimai.api;
const Timer = ThisExtension.imports.utility.timer;

class Extension
{
    // UI elements:
    _indicator;
    _icon;

    // Components:
    /** @type {import('./kimai/api').Api|null} */
    _api;
    _timer;
    _settings;

    // State:
    _running;
    _updateIntervalMilliseconds;

    // Constant objects:
    _kimaiIconEnabled;
    _kimaiIconDisabled;

    constructor ()
    {
        this._indicator = null;
        this._icon = null;

        this._api = null;
        this._timer = null;
        this._settings = null;

        this._running = false;
        this._updateIntervalMilliseconds = 5 * 1000;

        this._kimaiIconEnabled = Gio.icon_new_for_string(`${ThisExtension.path}/images/kimai-icon-enabled.png`);
        this._kimaiIconDisabled = Gio.icon_new_for_string(`${ThisExtension.path}/images/kimai-icon-disabled.png`);
    }

    enable ()
    {
        if (!this._running)
        {
            this._settings = ExtensionUtils.getSettings(Constants.SettingsSchema);

            this._updateSettings();
            this._createIndicator();
            this._createApi();
            this._startTimer();

            this._running = true;

            this._updateStatus();
        }
    }

    disable ()
    {
        this._running = false;

        this._stopTimer();

        if (this._api !== null)
        {
            this._api.close();
            this._api = null;
        }

        if (this._indicator !== null)
        {
            this._indicator.destroy();
            this._indicator = null;
        }

        this._settings = null;
        this._icon = null;
    }

    _createIndicator ()
    {
        const indicatorName = `${ThisExtension.metadata.name} Indicator`;
        this._indicator = new PanelMenu.Button(0.0, indicatorName, false);

        const boxLayout = new St.BoxLayout(
            {
                style_class: 'panel-status-menu-box'
            }
        );
        this._indicator.add_child(boxLayout);

        this._icon = new St.Icon(
            {
                gicon: this._kimaiIconDisabled,
                style_class: 'system-status-icon',
            }
        );
        boxLayout.add_child(this._icon);

        Main.panel.addToStatusArea(indicatorName, this._indicator);
    }

    _createApi ()
    {
        const baseUrl = this._settings.get_string(Constants.SettingKeyBaseUrl);
        const username = this._settings.get_string(Constants.SettingKeyUsername);
        const token = this._settings.get_string(Constants.SettingKeyToken);

        this._api = new KimaiApi.Api(baseUrl, username, token);
    }

    _startTimer ()
    {
        this._timer = Timer.setInterval(this._onTimerInterval.bind(this), this._updateIntervalMilliseconds);
    }

    _stopTimer()
    {
        if (this._timer !== null)
        {
            Timer.clearInterval(this._timer);
            this._timer = null;
        }
    }

    _onTimerInterval ()
    {
        const previousInterval = this._updateIntervalMilliseconds;

        this._updateSettings();
        this._updateStatus();

        if (previousInterval !== this._updateIntervalMilliseconds)
        {
            this._stopTimer();
            this._startTimer();
        }
    }

    _updateSettings ()
    {
        if (this._api !== null)
        {
            const baseUrl = this._settings.get_string(Constants.SettingKeyBaseUrl);
            const username = this._settings.get_string(Constants.SettingKeyUsername);
            const token = this._settings.get_string(Constants.SettingKeyToken);

            this._api.setBaseUrl(baseUrl);
            this._api.setAuthentification(username, token);
        }

        this._updateIntervalMilliseconds = this._settings.get_int(Constants.SettingKeyUpdateInterval) * 1000;
    }

    _updateStatus ()
    {
        this._api?.getFirstActiveTimesheet(
            (timesheet) =>
            {
                if (timesheet === null)
                {
                    this._icon.set_gicon(this._kimaiIconDisabled);
                }
                else
                {
                    this._icon.set_gicon(this._kimaiIconEnabled);
                }
            }
        );
    }

    _log (message)
    {
        log(`${ThisExtension.metadata.name} - ${message}`);
    }
}

function init ()
{
    return new Extension();
}

// HACK: Allow referencing this module in JSDoc by deluding it into thinking this was a module:
var module = {};
module.exports = { init };
