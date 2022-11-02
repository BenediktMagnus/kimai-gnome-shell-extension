#!/usr/bin/env gjs

// External imports:
const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;

// Internal imports:
const ThisExtension = ExtensionUtils.getCurrentExtension();
const Timer = ThisExtension.imports.utility.timer;

// Constants:
const refreshIntervalMilliseconds = 60 * 1000;

class Extension
{
    // UI elements:
    _indicator;
    _icon;

    // Components:
    _timer;

    // State:
    _running;

    // Constant objects:
    _kimaiIconEnabled;
    _kimaiIconDisabled;

    constructor ()
    {
        this._indicator = null;
        this._icon = null;

        this._timer = null;

        this._running = false;

        this._kimaiIconEnabled = Gio.icon_new_for_string(`${ThisExtension.path}/images/kimai-icon-enabled.png`);
        this._kimaiIconDisabled = Gio.icon_new_for_string(`${ThisExtension.path}/images/kimai-icon-disabled.png`);
    }

    enable ()
    {
        if (!this._running)
        {
            this._createIndicator();
            this._startTimer();

            this._running = true;
        }
    }

    disable ()
    {
        this._running = false;

        if (this.timer !== null)
        {
            Timer.clearInterval(this.timer);
            this.timeout = null;
        }

        if (this._indicator !== null)
        {
            this._indicator.destroy();
            this._indicator = null;
        }

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

    _startTimer ()
    {
        this._timer = Timer.setInterval(this._onTimerInterval.bind(this), refreshIntervalMilliseconds);
    }

    _onTimerInterval ()
    {
        // Hole Status von der API
        // Setze Icon entsprechend: this._icon.set_gicon(this._kimaiIconEnabled);
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
