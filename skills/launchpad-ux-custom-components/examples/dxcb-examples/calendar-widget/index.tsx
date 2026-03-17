// @ts-nocheck
// Calendar Widget component example used in the DXCB skill.
// Reference-only example; not part of the running app build.

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { type EventContentArg, type EventClickArg } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import {
    withConfiguration,
    registerIcon,
    Icon,
    Text,
    Status,
    Link,
    FieldValueList,
    Card,
    CardHeader,
    CardContent,
    Button,
    useTheme,
} from '@pega/cosmos-react-core';
import StyledEventWrapper from './styles';
import * as plusIcon from '@pega/cosmos-react-core/lib/components/Icon/icons/plus.icon';
import '../shared/create-nonce';
import { getMappedKey } from '../shared/utils';

registerIcon(plusIcon);

const VIEW_TYPE = {
    DAY: 'timeGridDay',
    WEEK: 'timeGridWeek',
    MONTH: 'dayGridMonth',
};

export type CalendarProps = {
    heading: string;
    dataPage: string;
    dateProperty: string;
    startTimeProperty: string;
    endTimeProperty: string;
    createClassname?: string;
    defaultViewMode: 'Monthly' | 'Weekly' | 'Daily';
    nowIndicator: boolean;
    weekendIndicator: boolean;
    getPConnect: any;
};

type Event = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    item: any;
};

type DateInfo = {
    view: { type: string };
    startStr?: string;
    start?: Date;
    end?: Date;
};

export const PegaExtensionsCalendar = (props: CalendarProps) => {
    const {
        heading = '',
        dataPage = '',
        dateProperty: rawDateProperty,
        startTimeProperty: rawStartTimeProperty,
        endTimeProperty: rawEndTimeProperty,
        createClassname = '',
        defaultViewMode = 'Monthly',
        nowIndicator = true,
        weekendIndicator = true,
        getPConnect,
    } = props;

    const dateProperty = getMappedKey(rawDateProperty?.trim() || 'SessionDate');
    const startTimeProperty = getMappedKey(rawStartTimeProperty?.trim() || 'StartTime');
    const endTimeProperty = getMappedKey(rawEndTimeProperty?.trim() || 'EndTime');

    const [events, setEvents] = useState<Array<Event>>([]);
    const calendarRef = useRef(null);
    const theme = useTheme();
    let dateInfo: DateInfo = { view: { type: VIEW_TYPE.MONTH } };
    const dateInfoStr = localStorage.getItem('fullcalendar');
    if (dateInfoStr) {
        dateInfo = JSON.parse(dateInfoStr);
        if (dateInfo.view.type === VIEW_TYPE.MONTH && dateInfo.end && dateInfo.start) {
            const endDate = new Date(dateInfo.end).valueOf();
            const startDate = new Date(dateInfo.start).valueOf();
            const middle = new Date(endDate - (endDate - startDate) / 2);
            dateInfo.startStr = `${middle.toISOString().substring(0, 7)}-01`;
        }
    }

    const getDefaultView = () => {
        if (dateInfo?.view?.type) {
            return dateInfo.view.type;
        }
        let defaultView;
        switch (defaultViewMode) {
            case 'Monthly':
                defaultView = VIEW_TYPE.MONTH;
                break;
            case 'Weekly':
                defaultView = VIEW_TYPE.WEEK;
                break;
            case 'Daily':
                defaultView = VIEW_TYPE.DAY;
                break;
            default:
                defaultView = VIEW_TYPE.MONTH;
        }
        return defaultView;
    };

    const addNewEvent = () => {
        if (createClassname) {
            getPConnect().getActionsApi().createWork(createClassname, {
                openCaseViewAfterCreate: false,
            });
        }
    };

    const renderEventContent = (eventInfo: EventContentArg) => {
        const obj = eventInfo.event._def.extendedProps.item;
        let isdayGrid = true;
        if (eventInfo.view.type === VIEW_TYPE.DAY || eventInfo.view.type === VIEW_TYPE.WEEK) {
            isdayGrid = false;
        }
        const eventDateStr = `${obj[startTimeProperty].substring(0, 5)} - ${obj[endTimeProperty].substring(0, 5)}`;
        const pyID = getMappedKey('pyID');
        const pxObjClass = getMappedKey('pxObjClass');
        const pzInsKey = getMappedKey('pzInsKey');
        const pyStatusWork = getMappedKey('pyStatusWork');
        const linkURL = (window as any).PCore.getSemanticUrlUtils().getResolvedSemanticURL(
            (window as any).PCore.getSemanticUrlUtils().getActions().ACTION_OPENWORKBYHANDLE,
            { caseClassName: obj[pxObjClass] },
            { workID: obj[pyID] },
        );
        const linkEl = (
            <Link
                href={linkURL}
                previewable
                style={
                    isdayGrid
                        ? {
                            wordBreak: 'break-all',
                        }
                        : {
                            color: '#FFF',
                            wordBreak: 'break-all',
                        }
                }
                onPreview={() => {
                    getPConnect().getActionsApi().showCasePreview(encodeURI(eventInfo.event.id), {
                        caseClassName: obj[pxObjClass],
                    });
                }}
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    if (!e.metaKey && !e.ctrlKey) {
                        e.preventDefault();
                        getPConnect().getActionsApi().openWorkByHandle(obj[pzInsKey], obj[pxObjClass]);
                    }
                }}
            >
                {isdayGrid ? obj[pyID] : `${eventInfo.event.title} - ${eventDateStr}`}
            </Link>
        );
        if (!isdayGrid) {
            return linkEl;
        }
        return (
            <StyledEventWrapper theme={theme}>
                <Text variant='h3'>{eventInfo.event.title}</Text>
                <FieldValueList
                    variant='inline'
                    style={{
                        gap: 'normal',
                    }}
                    fields={[
                        {
                            id: 'id',
                            name: 'Case ID',
                            value: linkEl,
                        },
                        {
                            id: 'time',
                            name: 'time',
                            value: eventDateStr,
                        },
                        {
                            id: 'status',
                            name: 'Status',
                            value: <Status variant='success'>{obj[pyStatusWork]}</Status>,
                        },
                    ]}
                />
            </StyledEventWrapper>
        );
    };

    const loadEvents = () => {
        const pzInsKey = getMappedKey('pzInsKey');
        const pyLabel = getMappedKey('pyLabel');

        (window as any).PCore.getDataApiUtils()
            .getData(getMappedKey(dataPage), {})
            .then((response: any) => {
                if (response.data.data !== null) {
                    const tmpevents: Array<Event> = [];
                    response.data.data.forEach((item: any) => {
                        const sessionDate = item[dateProperty];
                        const startTime = item[startTimeProperty];
                        const endTime = item[endTimeProperty];
                        if (sessionDate && startTime && endTime) {
                            tmpevents.push({
                                id: item[pzInsKey],
                                title: item[pyLabel],
                                start: new Date(`${sessionDate}T${startTime}`),
                                end: new Date(`${sessionDate}T${endTime}`),
                                item,
                            });
                        }
                    });
                    setEvents(tmpevents);
                }
            });
    };

    const handleEventClick = (eventClickInfo: EventClickArg) => {
        const pzInsKey = getMappedKey('pzInsKey');
        const pxObjClass = getMappedKey('pxObjClass');
        const eventDetails = eventClickInfo.event.extendedProps;
        getPConnect().getActionsApi().openWorkByHandle(eventDetails.item[pzInsKey], eventDetails.item[pxObjClass]);
    };

    const handleDateChange = (objInfo: any) => {
        localStorage.setItem('fullcalendar', JSON.stringify(objInfo));
    };

    useEffect(() => {
        (window as any).PCore.getPubSubUtils().subscribe(
            (window as any).PCore.getEvents().getCaseEvent().ASSIGNMENT_SUBMISSION,
            () => {
                loadEvents();
            },
            'ASSIGNMENT_SUBMISSION',
        );
        return () => {
            (window as any).PCore.getPubSubUtils().unsubscribe(
                (window as any).PCore.getEvents().getCaseEvent().ASSIGNMENT_SUBMISSION,
                'ASSIGNMENT_SUBMISSION',
            );
        };
    }, []);

    useEffect(() => {
        loadEvents();
    }, []);

    return (
        <Card>
            <CardHeader
                actions={
                    createClassname ? (
                        <Button
                            variant='simple'
                            label={getPConnect().getLocalizedValue('Create new event')}
                            icon
                            compact
                            onClick={addNewEvent}
                        >
                            <Icon name='plus' />
                        </Button>
                    ) : undefined
                }
            >
                <Text variant='h2'>{heading}</Text>
            </CardHeader>
            <CardContent>
                <FullCalendar
                    ref={calendarRef}
                    customButtons={{
                        prevButton: {
                            text: 'Previous',
                            click: () => {
                                if (calendarRef) {
                                    const cal: any = calendarRef.current;
                                    const calendarAPI = cal.getApi();
                                    calendarAPI?.prev();
                                }
                            },
                        },
                        nextButton: {
                            text: 'Next',
                            click: () => {
                                if (calendarRef) {
                                    const cal: any = calendarRef.current;
                                    const calendarAPI = cal.getApi();
                                    calendarAPI?.next();
                                }
                            },
                        },
                    }}
                    headerToolbar={{
                        left: 'prevButton,nextButton',
                        center: 'title',
                        right: `${VIEW_TYPE.MONTH},${VIEW_TYPE.WEEK},${VIEW_TYPE.DAY}`,
                    }}
                    plugins={[dayGridPlugin, timeGridPlugin]}
                    initialView={getDefaultView()}
                    selectable
                    nowIndicator={nowIndicator}
                    weekends={weekendIndicator}
                    allDayText='All day'
                    slotMinTime='07:00:00'
                    slotMaxTime='19:00:00'
                    height={650}
                    slotEventOverlap={false}
                    events={events}
                    eventContent={renderEventContent}
                    eventClick={handleEventClick}
                    datesSet={handleDateChange}
                    initialDate={dateInfo !== null && dateInfo.startStr ? dateInfo.startStr.substring(0, 10) : undefined}
                    slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                />
            </CardContent>
        </Card>
    );
};

export default withConfiguration(PegaExtensionsCalendar);
