const ByteArray = imports.byteArray;
const GLib = imports.gi.GLib;
const Soup = imports.gi.Soup;

/** @typedef {import('./definitions/timesheet').Timesheet} Timesheet */

var Api = class Api
{
    _baseUrl;
    _username;
    _token;

    _session;

    /**
     * @param {string} baseUrl
     * @param {string} username
     * @param {string} token
     */
    constructor (baseUrl, username, token)
    {
        this._session = new Soup.Session();

        this._baseUrl = baseUrl;
        this._username = username;
        this._token = token;
        this._userId = null;

        if (!this._baseUrl.endsWith('/'))
        {
            this._baseUrl += '/';
        }
        this._baseUrl += 'api';
    }

    close ()
    {
        this._session.abort();
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
                const rawData = this._session.send_and_read_finish(message).get_data();
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

// HACK: Allow referencing this module in JSDoc by deluding it into thinking this was a module:
var module = {};
module.exports = { Api };
