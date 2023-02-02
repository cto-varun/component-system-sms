import React, { useState, useEffect } from 'react';
import { Table, Tooltip } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import moment from 'moment';
import { MessageBus } from '@ivoyant/component-message-bus';

import SMSFilter from './SMSFilter';

import './styles.css';

const columns = [
    {
        title: 'SMS ID',
        dataIndex: 'id',
        key: 'id',
        render: (data) => <div className="text-green text-bold">{data}</div>,
    },
    {
        title: 'SENT DATE',
        dataIndex: 'sentTime',
        key: 'sentTime',
        render: (data) => <>{moment(data).format('MM/DD/YY h:mm a')}</>,
    },
    {
        title: 'RECIEVED DATE',
        dataIndex: 'deliveryTime',
        key: 'deliveryTime',
        render: (data) => <>{moment(data).format('MM/DD/YY h:mm a')}</>,
    },
    {
        title: 'SOURCE',
        dataIndex: 'sentFrom',
        key: 'sentFrom',
    },
    {
        title: 'STATE',
        dataIndex: 'deliveryStatus',
        key: 'deliveryStatus',
    },
    {
        title: 'STATUS',
        dataIndex: 'status',
        key: 'status',
    },
    {
        title: 'MESSSAGE TYPE',
        dataIndex: 'type',
        key: 'type',
    },
    {
        title: '',
        dataIndex: 'text',
        key: 'text',
        render: (data) => (
            <>
                <Tooltip title={data}>
                    <CommentOutlined />
                </Tooltip>
            </>
        ),
    },
];

export default function SystemSms({ properties, parentProps }) {
    const [smsData, setSmsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [errorMessage, setErrorMessage] = useState(
        'No SMS found matching the request criteria'
    );
    const [data, setData] = useState({
        smsList: [],
        allSmsList: [],
        phoneNumber: '',
    });
    const {
        workflow,
        responseMapping,
        successStates,
        errorStates,
    } = properties?.workflow;

    useEffect(() => {
        if (!smsData.length) {
            handleSmsData();
        }
        return () => {
            MessageBus.unsubscribe(
                workflow + '-' + window[sessionStorage.tabId].NEW_BAN
            );
        };
    }, []);

    const handleResponse = (subscriptionId, topic, eventData, closure) => {
        const state = eventData.value;
        const isSuccess = successStates.includes(state);
        const isFailure = errorStates.includes(state);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                const response = eventData?.event?.data?.data;
                setSmsData(response);
                setData({
                    ...response,
                    smsList: response[currentIndex]?.smsList,
                    allSmsList: response[currentIndex]?.smsList,
                    phoneNumber: response[currentIndex]?.phoneNumber,
                });
            }
            if (isFailure) {
                setSmsData([]);
                setData({
                    smsList: [],
                    allSmsList: [],
                    phoneNumber: '',
                });
                setErrorMessage(
                    eventData?.event?.data?.message ||
                        'No SMS found matching the request criteria'
                );
            }
            setLoading(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    const handleSmsData = (byDate) => {
        const datasource =
            parentProps.datasources[properties?.workflow?.datasource];
        const ban = window[window.sessionStorage?.tabId].NEW_BAN;
        const registrationId = `${workflow}-${ban}`;
        const requestBody = { billingAccountNumber: ban };
        setLoading(true);
        if (byDate) requestBody.byDate = byDate;

        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleResponse
        );
        MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource,
                request: {
                    body: requestBody,
                },
                responseMapping,
            },
        });
    };

    function handleChange(index) {
        setCurrentIndex(index);
        setData({
            ...data,
            smsList: smsData[index]?.smsList,
            allSmsList: smsData[index]?.smsList,
            phoneNumber: smsData[index]?.phoneNumber,
        });
    }

    const { smsList } = data;

    return (
        <div>
            <SMSFilter
                setData={setData}
                handleChange={handleChange}
                handlePostSms={handleSmsData}
                smsdata={smsData}
                data={data}
                currentIndex={currentIndex}
            />
            <Table
                columns={columns}
                dataSource={smsList || []}
                rowClassName="bg-transparent"
                className="bg-transparent"
                locale={{ emptyText: errorMessage }}
                loading={loading}
            />
        </div>
    );
}
