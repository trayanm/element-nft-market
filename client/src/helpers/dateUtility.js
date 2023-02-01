export const dateUtility = {
    copyFullDate: function (date) {
        if (typeof date === 'string')
            date = new Date(date);

        const dateCopy = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
        return dateCopy;
    },

    dateDays: function (theDate, days) {
        const dateCopy = new Date(theDate);
        dateCopy.setDate(dateCopy.getDate() + days);
        return dateCopy;
    },

    addHours: function (date, hours) {
        const dateCopy = dateUtility.copyFullDate(date);
        return new Date(dateCopy.setTime(dateCopy.getTime() + hours * 3600000));
    },

    addMinutes: function (date, minutes) {
        const dateCopy = dateUtility.copyFullDate(date);
        return new Date(dateCopy.setTime(dateCopy.getTime() + minutes * 60000));
    },

    addSeconds: function (date, seconds) {
        const dateCopy = dateUtility.copyFullDate(date);

        dateCopy.setSeconds(dateCopy.getSeconds() + seconds);

        //dateCopy.setTime(dateCopy.getTime() + (seconds * 1000));
        return dateCopy;
    }
}