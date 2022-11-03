'use strict';

// External imports:
const Adw = imports.gi.Adw;
const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

// Internal imports:
const ThisExtension = ExtensionUtils.getCurrentExtension();
/** @type {import('./utility/constants')} */
const Constants = ThisExtension.imports.utility.constants;

function init ()
{
}

function fillPreferencesWindow (window)
{
    const settings = ExtensionUtils.getSettings(Constants.SettingsSchema);

    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    _createStringEntry('Kimai Username', Constants.SettingKeyUsername, group, settings);
    _createStringEntry('Kimai API Password', Constants.SettingKeyToken, group, settings);
    _createStringEntry('Kimai Base URL', Constants.SettingKeyBaseUrl, group, settings);
    _createIntegerEntry('Update Interval in Seconds', Constants.SettingKeyUpdateInterval, group, settings);

    window.add(page);
}

function _createStringEntry (title, settingKey, group, settings)
{
    const entry = new Gtk.Entry(
        {
            width_chars: 48,
            vexpand: false,
            sensitive: false,
            valign: Gtk.Align.CENTER
        }
    );
    entry.set_text(settings.get_string(settingKey));

    settings.bind(
        settingKey,
        entry,
        'text',
        Gio.SettingsBindFlags.DEFAULT
    );

    const actionRow = new Adw.ActionRow(
        {
            title: title,
            activatable_widget: entry
        }
    );
    actionRow.add_suffix(entry);
    group.add(actionRow);
}

function _createIntegerEntry (title, settingKey, group, settings)
{
    const spinButton = new Gtk.SpinButton(
        {
            adjustment: new Gtk.Adjustment(
                {
                    lower: 5,
                    upper: 6000,
                    step_increment: 1
                }
            )
        }
    );

    settings.bind(
        settingKey,
        spinButton,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );

    const actionRow = new Adw.ActionRow(
        {
            title: title,
            activatable_widget: spinButton
        }
    );
    actionRow.add_suffix(spinButton);
    group.add(actionRow);
}

// HACK: Allow referencing this module in JSDoc by deluding it into thinking this was a module:
var module = {};
module.exports = {
    init,
    fillPreferencesWindow,
 };
