window.getWindowContainer = function() {
    let element1 = $('td.PSGROUPBOXLABEL:contains("class section(s) found")');
    let element2 = $("#DERIVED_REGFRM1_TITLE1");


    let table_container = $("#win0divDERIVED_CLSRCH_GROUP6 #win0divSSR_CLSRSLT_WRK_GROUPBOX1 #ACE_SSR_CLSRSLT_WRK_GROUPBOX1");
    if (element1.length == 0 || element2.length == 0 || table_container.length == 0) return null;
    return table_container;
}


window.prettifySection = function(text) {
    // Example: '0002-LEC REGULAR'
    try {

        let options = {
            "LEC": 1,
            "LAB": 2,
            "RES": 3,
            "DIS": 4,
        };
        let description = null
        let option_type = null;

        // Loop through the options
        for (const option in options) {
            if (text.includes(option)) {
                description = text.replaceAll("-" + option, "").replaceAll(option, "").replaceAll("\n", " ").trim();
                option_type = options[option];

                return {
                    type: option_type, // The matching option type (LEC, LAB, DIS)
                    description: description, // Cleaned description without the option
                    text: option,
                };

            }
        }

        // default case
        option_type = 0;

        let section_text = text.split("\n")[0].split("-")[1];
        description = text.replaceAll("-" + section_text, "").replaceAll(section_text, "").replaceAll("\n", " ").trim();
        return {
            type: option_type, // The matching option type (LEC, LAB, DIS)
            description: description, // Cleaned description without the option
            text: section_text,
        };

    } catch (err) {
        console.log(err);
        return null;
    }
};

window.prettifyMode = function(mode) {
    // Example: 'IN PERSON (P)'
    try {
        let options = {
            "P": 0, // In Person
            "M": 1, // Mixed
            "MR": 2, // Mixed-Mode 20% Classroom
            "ML": 3, // Mixed with Livestream
            "RL": 4, // Livestream, 20% Classroom Attendance
            "RS": 5, // Video Content, 20% Classroom Attendance
            "VL": 6, // Video Livestream
            "V": 7, // Online Video Content
            "W": 8, //Web-Based
        };

        let typeId = null;

        // Loop through options to find the matching mode
        for (let option in options) {
            // Check if the text contains the mode in parentheses, e.g., (P), (M), (ML)
            if (mode.includes("(" + option + ")")) {
                return options[option]; // Get the corresponding type ID from the options
            }
        }
        return null;
    } catch (err) {
        console.log(err);
        return null;
    }
};

window.parseTime = function(timeString) {
    if (timeString == null) return null;
    const [time, modifier] = timeString.split(/(AM|PM)/i);
    if (time == null || modifier == null) return null;
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
    }
    if (modifier.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
    }

    return {
        hours,
        minutes
    };
}

window.prettifyDaysAndTimesLine = function(inputString) {
    try {
        const daysMap = {
            'Mo': 0,
            'Tu': 1,
            'We': 2,
            'Th': 3,
            'Fr': 4,
        };
        const result = {
            days: [0, 0, 0, 0, 0],
            start_time: '',
            end_time: '',
            duration: ''
        };

        const daysPart = inputString.split(' ')[0];
        const timePart = inputString.substring(daysPart.length).trim();

        // Process days part
        for (let i = 0; i < daysPart.length; i += 2) {
            const day = daysPart.substring(i, i + 2);
            if (daysMap.hasOwnProperty(day)) {
                result.days[daysMap[day]] = 1;
            }
        }

        // Process time part
        const [startTime, endTime] = timePart.split(' - ');

        result.start_time = startTime;
        result.end_time = endTime;

        // Calculate duration
        const start = parseTime(startTime);
        const end = parseTime(endTime);

        if (start == null || end == null) return null;

        let durationMinutes = (end.hours * 60 + end.minutes) - (start.hours * 60 + start.minutes);
        if (durationMinutes < 0) {
            durationMinutes += 24 * 60; // handle case where end time is past midnight
        }

        if (durationMinutes >= 60) {
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            result.duration = `${hours} hour`;
            if (minutes > 0) result.duration += ` ${minutes} min`;
        } else {
            result.duration = `${durationMinutes} min`;
        }

        return result;
    } catch (ex) {
        console.log(ex);
        return null;
    }
}

window.prettifyDaysAndTimes = function(input) {
    // Example: 'MoWeFr 9:00 AM - 11:00 AM'
    let data = [];
    if (!input || input.length == 0) return;
    let split = input.split("<br>");
    for (let i = 0; i < split.length; i++) {
        if (!split[i] || split[i].length == 0) continue;
        let line = split[i].replaceAll("\n", "").trim();
        var line_data = window.prettifyDaysAndTimesLine(line);
        if (!line_data) continue;
        data.push(line_data);
    }
    if (data.length == 0) return null;
    return data;
};

window.prettifyRoom = function(text) {
    if (!text || text == null || text.length == 0) return null;
    // Check if there is a space between the building and room number
    if (!text.includes(" ")) {
        return {
            "text": text.trim()
        };
    }

    // Split the text into building and room
    let [building, room] = text.split(" ");

    // Generate Google Maps URL
    let googleMapsUrl = `https://www.google.com/maps/search/University+of+Central+Florida+${encodeURIComponent(building)}`;

    return {
        "building": building.trim(),
        "room": room.trim(),
        "google_maps_url": googleMapsUrl
    };
};

window.prettifyRooms = function(text) {
    let data = [];
    let split = text.split("<br>");
    for (let i = 0; i < split.length; i++) {
        let line = split[i];

        let row_data = window.prettifyRoom(line);
        if (row_data == null) continue;
        data.push(row_data);
    }
    return data;
}


window.prettifyInstructor = function(text) {
    try {
        var instructors = [];
        var split = text.split("<br>");
        for (let i = 0; i < split.length; i++) {
            var name = split[i].replaceAll(",", "").trim();
            if (name.length > 0 && !instructors.includes(name)) instructors.push(name);
        }
        return instructors;
    } catch (err) {
        console.log(err);
        return null;
    }
};

window.prettifyMeetingDates = function(text) {
    // Example: '01/06/2025 - 01/12/2025'
    if (!text || text.length == 0) return null;
    if (text.includes("<br>")) text = text.split("<br>")[0].trim();
    return text.trim();
};

window.prettifyStatus = function(text) {
    // Example: OPEN / WAITLIST / CLOSED
    let options = {
        "open": 0,
        "waitlist": 1,
        "closed": 2,
    };
    // Loop through options to find the corresponding option_id
    text = text.trim().toLowerCase();
    if (options.hasOwnProperty(text)) {
        return options[text];
    }
    return null;
};

window.extractDataFromTableRow = function(container) {
    var tr = $(container).find("[id^='trSSR_CLSRCH_MTG1\\$']");
    if (tr.length === 0) return null;

    // Extracting data and elements from each column in the row
    let classNumberElement = $(tr).find("[id^='MTG_CLASS_NBR']")[0] ?? null;
    let classNumber = parseInt($(classNumberElement)?.find("a")?.text()?.trim() ?? null);

    let sectionDetailsElement = $(tr).find("[id^='MTG_CLASSNAME']")[0] ?? null;
    let sectionDetails = $(sectionDetailsElement)?.text()?.trim() ?? null;

    let modeElement = $(tr).find("[id^='INSTRUCT_MODE_DESCR']")[0] ?? null;
    let mode = $(modeElement)?.text()?.trim() ?? null;

    let timesElement = $(tr).find("[id^='MTG_DAYTIME']")[0] ?? null;
    let times = $(timesElement)?.html() ?? null;

    let roomElement = $(tr).find("[id^='MTG_ROOM']")[0] ?? null;
    let room = $(roomElement)?.html() ?? null;

    let instructorElement = $(tr).find("[id^='MTG_INSTR']")[0] ?? null;
    let instructor = $(instructorElement)?.html() ?? null;

    let datesElement = $(tr).find("[id^='MTG_TOPIC']")[0] ?? null;
    let dates = $(datesElement)?.html() ?? null;

    let statusElementImage = $(tr).find("[id^='win0divDERIVED_CLSRCH_SSR_STATUS_LONG'] img")[0] ?? null;
    let status = "?";
    if (statusElementImage) {
        let statusSrc = $(statusElementImage)?.attr("src");
        if (statusSrc?.includes("STATUS_OPEN")) status = "open";
        if (statusSrc?.includes("STATUS_WAITLIST")) status = "waitlist";
        if (statusSrc?.includes("STATUS_CLOSED")) status = "closed";
    }

    let isZeroCost = $(tr).find("[id^='win0divFX_DERIVED_RO_FX_ZERO_COST_TXTBK']").length > 0;

    let syllabusElement = $(tr).find("[id^='FX_INST_CLS_WRK_HTMLAREA']")[0] ?? null;
    let syllabusHref = $(syllabusElement)?.find("a")?.attr("href") ?? null;

    let buttonElement = $(tr).find("[id^='win0divSSR_PB_SELECT'] a input")[0] ?? null;
    let buttonAction = null;
    if (buttonElement) {
        let buttonId = $(buttonElement).attr('id');
        let href = $(buttonElement).attr("onclick");
        if (href != null) buttonAction = href.replace("this.id", "'" + buttonId + "'");
    }
    buttonElement = $(buttonElement)?.clone() ?? null;

    // Assembling the object
    return {
        class: classNumber,
        section: window.prettifySection(sectionDetails),
        mode: window.prettifyMode(mode),
        daysAndTimes: window.prettifyDaysAndTimes(times),
        rooms: window.prettifyRooms(room),
        instructors: window.prettifyInstructor(instructor),
        meetingDates: window.prettifyMeetingDates(dates),
        status: window.prettifyStatus(status),
        syllabusHref: syllabusHref,
        isZeroCost: isZeroCost,
        elements: {
            classElement: classNumberElement,
            sectionElement: sectionDetailsElement,
            modeElement: modeElement,
            daysAndTimesElement: timesElement,
            roomElement: roomElement,
            instructorElement: instructorElement,
            meetingDatesElement: datesElement,
            statusElementImage: statusElementImage,
            syllabusElement: syllabusElement,
            buttonElement: buttonElement,
            buttonAction: buttonAction,
        }
    };


}

window.generateTable = function(container, data) {
    container.empty();
    let table_container = $($(container.find("table tbody tr"))[1]);
    //table_container.empty();

    let parent_container = container.closest('tr');
    parent_container.find("td").css("height", "fit-content");
    $("#ACE_SSR_CLSRSLT_WRK_GROUPBOX1 td").css("height", "fit-content");


    generateTableInContainerWithData(container, data);
}

var clicked = false;
window.handleTable = function(idx, container) {
    let rows = $(container).find('div[id^="win0divSSR_CLSRSLT_WRK_GROUPBOX3$"]');
    if (rows.length == 0) return;

    let data = [];
    rows.each(function(idx) {
        let row_data = window.extractDataFromTableRow(this);
        if (row_data != null) {
            data.push(row_data);
        }
    });
    if (data == null) return null;
    console.log("Generating table " + idx + "...");
    console.log(data);
    let child_container = $(container).find($('table[id^="ACE_SSR_CLSRSLT_WRK_GROUPBOX2$"]'));
    if (child_container.length == 0) return;

    window.generateTable($(child_container[0]), data);
};


extensionEnabled = false;

window.myscan = function() {
    checkExtensionState();
    if (!extensionEnabled) return;
    let table_container = window.getWindowContainer();
    if (table_container == null) return;

    let tables = $('div[id^="win0divSSR_CLSRSLT_WRK_GROUPBOX2$"]');
    if (tables.length == 0) return;
    tables.each(function(i) {
        window.handleTable(i, this);
    });
}




function checkExtensionState() {
    chrome.storage.sync.get('extensionEnabled', function(data) {
        let _extensionEnabled = data.extensionEnabled !== undefined ? data.extensionEnabled : true;
        if (_extensionEnabled != extensionEnabled) {
            extensionEnabled = _extensionEnabled;
        }
    });
}

$(document).ready(function() {
    $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">');
    $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">');
    $('head').append('<link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/jquery.dataTables.min.css">');

    setInterval(window.myscan, 300);

    checkExtensionState();
});