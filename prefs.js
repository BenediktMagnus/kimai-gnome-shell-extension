'use strict';

// External imports:
import * as Adw from 'gi://Adw';
import * as ExtensionUtils from 'resource:///org/gnome/shell/misc/extensionUtils.js';
import * as Gio from 'gi://Gio';
import * as Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Internal imports:
const ThisExtension = ExtensionUtils.getCurrentExtension();
/** @type {import('./utility/constants')} */
const Constants = ThisExtension.imports.utility.constants;

export default class KimaiExtensionPreferences extends ExtensionPreferences
{
    fillPreferencesWindow (window)
    {
        const settings = ExtensionUtils.getSettings(Constants.SettingsSchema);

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup();
        page.add(group);

        this._createStringEntry('Kimai Username', Constants.SettingKeyUsername, group, settings);
        this._createStringEntry('Kimai API Password', Constants.SettingKeyToken, group, settings);
        this._createStringEntry('Kimai Base URL', Constants.SettingKeyBaseUrl, group, settings);
        this._createIntegerEntry('Update Interval in Seconds', Constants.SettingKeyUpdateInterval, group, settings);

        window.add(page);
    }

    _createStringEntry (title, settingKey, group, settings)
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

    _createIntegerEntry (title, settingKey, group, settings)
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
}
