'use strict';

const ByteArray = imports.byteArray;
import GLib from 'gi://GLib';
import Soup from 'gi://Soup';

/** @typedef {import('./definitions/timesheet').Timesheet} Timesheet */

export class Api
{
    /** @type {string} */
    _baseUrl;
    /** @type {string} */
    _username;
    /** @type {string} */
    _token;

    /** @type {Soup.Session} */
    _session;

    /**
     * @param {string} baseUrl
     * @param {string} username
     * @param {string} token
     */
    constructor (baseUrl, username, token)
    {
        this._session = new Soup.Session();

        this.setBaseUrl(baseUrl);
        this.setAuthentification(username, token);
    }

    close ()
    {
        this._session.abort();
    }

    /**
     * @param {string} baseUrl
     */
    setBaseUrl (baseUrl)
    {
        let newBaseUrl = baseUrl;

        if (!newBaseUrl.endsWith('/'))
        {
            newBaseUrl += '/';
        }
        newBaseUrl += 'api';

        this._baseUrl = newBaseUrl;
    }

    /**
     * @param {string} username
     * @param {string} token
     */
    setAuthentification (username, token)
    {
        this._username = username;
        this._token = token;
    }

    /**
     * @param {string} path
     * @param {(data: object) => void} callback
     */
    _get (path, callback)
    {
        const message = Soup.Message.new('GET', this._baseUrl + path);
        this._addHeaders(message);

        this._sendAndRead(message, callback);
    }

    /**
     * @param {Soup.Message} message
     * @param {(data: object) => void} callback
     */
    _sendAndRead (message, callback)
    {
        this._session.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
            (_, message) =>
            {
                const response = this._session.send_and_read_finish(message);

                if (response === null)
                {
                    /* TODO: Either the server had an error or the settings are incorrect. This should be shown to the user.
                             The icon could become red in this case, but we needed to propagate the error upwards as not the API but the
                             extension should handle that. */
                    return;
                }

                const rawData = response.get_data()
                const dataString = ByteArray.toString(rawData);
                const data = JSON.parse(dataString);
                callback(data)
            }
        );
    }

    /**
     * @param {Soup.Message} message
     */
    _addHeaders (message)
    {
        const headers = message.request_headers;
        headers.append('X-AUTH-USER', this._username);
        headers.append('X-AUTH-TOKEN', this._token);
        headers.append('Accept', 'application/json');
    }

    /**
     * @param {(version: string) => void} callback
     */
    getVersion (callback)
    {
        this._get(
            '/version',
            (data) =>
            {
                callback(data.version);
            }
        );
    }

    /**
     * Get the current user.
     * @param {(me: object) => void} callback
     */
    getMe (callback)
    {
        this._get(
            '/users/me',
            callback
        );
    }

    /**
     * Get the current user's active timesheets.
     * @param {(timesheets: Timesheet[]) => void} callback
     */
    getActiveTimesheets (callback)
    {
        this._get(
            '/timesheets/active',
            callback
        );
    }

    /**
     * Get the first active timesheet.
     * @param {(timesheet: Timesheet|null) => void} callback
     */
    getFirstActiveTimesheet (callback)
    {
        this.getActiveTimesheets(
            (timesheets) =>
            {
                callback(timesheets.length > 0 ? timesheets[0] : null);
            }
        );
    }
}
