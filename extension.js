#!/usr/bin/env gjs

'use strict';

/// <reference path="./ambient.d.ts" />

// External imports:
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Gio from 'gi://Gio';
import St from 'gi://St';

// Internal imports:
/** @type {import('./utility/constants')} */
import * as Constants from './utility/constants.js';
/** @type {import('./kimai/api')} */
import * as KimaiApi from './kimai/api.js';
import * as Timer from './utility/timer.js';

export default class KimaiExtension extends Extension
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

    constructor (metadata)
    {
        super(metadata);

        this._indicator = null;
        this._icon = null;

        this._api = null;
        this._timer = null;
        this._settings = null;

        this._running = false;
        this._updateIntervalMilliseconds = 5 * 1000;

        this._kimaiIconEnabled = Gio.Icon.new_for_string(`${this.path}/images/kimai-icon-enabled.png`);
        this._kimaiIconDisabled = Gio.Icon.new_for_string(`${this.path}/images/kimai-icon-disabled.png`);
    }

    enable ()
    {
        if (!this._running)
        {
            this._settings = this.getSettings(Constants.SettingsSchema);

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

        this._icon = null;

        if (this._indicator !== null)
        {
            this._indicator.destroy();
            this._indicator = null;
        }

        this._settings = null;
    }

    _createIndicator ()
    {
        const indicatorName = `${this.metadata.name} Indicator`;
        this._indicator = new PanelMenu.Button(0.0, indicatorName, false);

        const boxLayout = new St.BoxLayout(
            {
                style_class: 'panel-status-menu-box'
            }
        );
        this._indicator.add_child(boxLayout);
        this._indicator.connect('button-press-event', this._onIndicatorClicked.bind(this));

        this._icon = new St.Icon(
            {
                gicon: this._kimaiIconDisabled,
                style_class: 'system-status-icon',
            }
        );
        boxLayout.add_child(this._icon);

        Main.panel.addToStatusArea(indicatorName, this._indicator);
    }

    _onIndicatorClicked ()
    {
        const baseUrl = this._settings.get_string(Constants.SettingKeyBaseUrl);

        if (baseUrl != undefined && baseUrl !== '')
        {
            Gio.AppInfo.launch_default_for_uri(baseUrl, null);
        }
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
        log(`${this.metadata.name} - ${message}`);
    }
}
