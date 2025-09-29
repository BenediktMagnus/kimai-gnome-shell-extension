'use strict';

const Mainloop = imports.mainloop;

export function setTimeout (func, millis /* , ... args */)
{
    let args = [];
    if (arguments.length > 2)
    {
        args = args.slice.call(arguments, 2);
    }

    let id = Mainloop.timeout_add(
        millis,
        () =>
        {
            func.apply(null, args);
            return false; // Stop repeating
        },
        undefined
    );

    return id;
}

export function clearTimeout (id)
{
    Mainloop.source_remove(id);
}

export function setInterval (func, millis /* , ... args */)
{
    let args = [];
    if (arguments.length > 2)
    {
        args = args.slice.call(arguments, 2);
    }

    let id = Mainloop.timeout_add(
        millis,
        () => {
            func.apply(null, args);
            return true; // Repeat
        },
        undefined
    );

    return id;
}

export function clearInterval (id)
{
    Mainloop.source_remove(id);
}
