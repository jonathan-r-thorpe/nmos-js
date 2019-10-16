import copy from 'clipboard-copy';
import React from 'react';
import { Link, Route } from 'react-router-dom';
import {
    ArrayField,
    BooleanField,
    BooleanInput,
    Button,
    ChipField,
    Edit,
    FormDataConsumer,
    FunctionField,
    ReferenceField,
    SaveButton,
    SelectInput,
    ShowButton,
    ShowController,
    ShowView,
    SimpleForm,
    SimpleShowLayout,
    TextField,
    TextInput,
    Title,
    Toolbar,
} from 'react-admin';
import get from 'lodash/get';
import set from 'lodash/set';
import Cookies from 'universal-cookie';
import {
    AppBar,
    Card,
    CardContent,
    Button as MaterialButton,
    Snackbar,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tabs,
    Typography,
} from '@material-ui/core';
import dataProvider from '../dataProvider';
import PaginationButton from '../components/PaginationButton';
import FilterField from '../components/FilterField';
import TAIField from '../components/TAIField';
import UrlField from '../components/URLField';
import MapTags from '../components/TagsField';
import JsonIcon from '../components/JsonIcon';
import SenderTransportParamsCardsGrid from '../components/SenderTransportParams';
import ConnectionShowActions from '../components/ConnectionShowActions';
import ConnectionEditActions from '../components/ConnectionEditActions';
import JSONViewer from '../components/JSONViewer';
import ItemArrayField from '../components/ItemArrayField';

const cookies = new Cookies();

export class SendersList extends React.Component {
    constructor(props) {
        super(props);
        this.filter = '';
        this.filterObject = {};
        this.state = {
            data: [],
        };
        this.nextPage = this.nextPage.bind(this);
        this.setFilter = this.setFilter.bind(this);
        this.filterPage = this.filterPage.bind(this);
        this.firstLoad = this.firstLoad.bind(this);
        this.firstLoad();
    }

    async firstLoad() {
        const params = {
            filter: {},
            pagination: { page: 1, perPage: 10 },
            sort: { field: 'id', order: 'DESC' },
        };
        const dataObject = await dataProvider('GET_LIST', 'senders', params);
        this.setState({ data: dataObject });
    }

    async nextPage(label) {
        const dataObject = await dataProvider(label, 'senders');
        this.setState({ data: dataObject });
    }

    setFilter(filterValue, name) {
        if (filterValue) {
            this.filterObject[name] = filterValue;
        } else {
            delete this.filterObject[name];
        }
        this.filterPage();
    }

    async filterPage() {
        const params = {
            filter: this.filterObject,
        };
        const dataObject = await dataProvider('GET_LIST', 'senders', params);
        this.setState({ data: dataObject });
    }

    render() {
        if (this.state.data.data) {
            return (
                <Card>
                    <Title title={'Senders'} />
                    <CardContent>
                        <Button
                            label={'Raw'}
                            href={this.state.data.url}
                            style={{ float: 'right' }}
                            title={'View raw'}
                        >
                            <JsonIcon />
                        </Button>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        style={{
                                            minWidth: '240px',
                                            paddingLeft: '32px',
                                        }}
                                    >
                                        Label{' '}
                                        <FilterField
                                            name="label"
                                            setFilter={this.setFilter}
                                        />
                                    </TableCell>
                                    <TableCell style={{ minWidth: '260px' }}>
                                        Transport{' '}
                                        <FilterField
                                            name="transport"
                                            setFilter={this.setFilter}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.data.data.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell component="th" scope="row">
                                            <ShowButton
                                                style={{
                                                    textTransform: 'none',
                                                }}
                                                basePath="/senders"
                                                record={item}
                                                label={item.label}
                                            />
                                        </TableCell>
                                        <TableCell>{item.transport}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <br />
                        <PaginationButton
                            label="FIRST"
                            nextPage={this.nextPage}
                        />
                        <PaginationButton
                            label="PREV"
                            nextPage={this.nextPage}
                        />
                        <PaginationButton
                            label="NEXT"
                            nextPage={this.nextPage}
                        />
                        <PaginationButton
                            label="LAST"
                            nextPage={this.nextPage}
                        />
                    </CardContent>
                </Card>
            );
        } else {
            return <div />;
        }
    }
}

const SendersTitle = ({ record }) => {
    return (
        <span>
            Sender:{' '}
            {record
                ? record.label
                    ? `${record.label}`
                    : `${record.id}`
                : 'Unknown'}
        </span>
    );
};

const ChipConditionalLabel = ({ record, source, ...props }) => {
    props.clickable = true;
    return record ? (
        record[source] ? (
            <ChipField {...{ record, source, ...props }} />
        ) : (
            <ChipField {...{ record, source: 'id', ...props }} />
        )
    ) : null;
};

export const SendersShow = props => {
    return (
        <ShowController {...props}>
            {controllerProps => (
                <div>
                    <AppBar position="static" color="default">
                        <Tabs
                            value={props.location.pathname}
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            <Tab
                                label="Summary"
                                value={`${props.match.url}`}
                                component={Link}
                                to={`${props.basePath}/${props.id}/show/`}
                            />
                            <Tab
                                label="Active"
                                value={`${props.match.url}/active`}
                                component={Link}
                                to={`${props.basePath}/${props.id}/show/active`}
                            />
                            <Tab
                                label="Staged"
                                value={`${props.match.url}/staged`}
                                component={Link}
                                to={`${props.basePath}/${props.id}/show/staged`}
                            />
                            <Tab
                                label="Transport File"
                                disabled={
                                    !get(
                                        controllerProps.record,
                                        '$transportfile'
                                    )
                                }
                                value={`${props.match.url}/transportfile`}
                                component={Link}
                                to={`${props.basePath}/${props.id}/show/transportfile`}
                            />
                        </Tabs>
                    </AppBar>
                    <Route
                        exact
                        path={`${props.basePath}/${props.id}/show/`}
                        render={() => (
                            <ShowSummaryTab
                                {...props}
                                controllerProps={controllerProps}
                            />
                        )}
                    />
                    <Route
                        exact
                        path={`${props.basePath}/${props.id}/show/active`}
                        render={() => (
                            <ShowActiveTab
                                {...props}
                                controllerProps={controllerProps}
                            />
                        )}
                    />
                    <Route
                        exact
                        path={`${props.basePath}/${props.id}/show/staged`}
                        render={() => (
                            <ShowStagedTab
                                {...props}
                                controllerProps={controllerProps}
                            />
                        )}
                    />
                    <Route
                        exact
                        path={`${props.basePath}/${props.id}/show/transportfile`}
                        render={() => (
                            <ShowTransportFileTab
                                record={controllerProps.record}
                            />
                        )}
                    />
                </div>
            )}
        </ShowController>
    );
};

const QueryVersion = () => {
    let url = cookies.get('Query API');
    return url.match(/([^/]+)(?=\/?$)/g)[0];
};

const ShowSummaryTab = ({ controllerProps, ...props }) => {
    return (
        <ShowView
            {...props}
            {...controllerProps}
            title={<SendersTitle />}
            actions={<ConnectionShowActions />}
        >
            <SimpleShowLayout>
                <TextField label="ID" source="id" />
                <TAIField source="version" />
                <TextField source="label" />
                <TextField source="description" />
                <FunctionField
                    label="Tags"
                    render={record =>
                        Object.keys(record.tags).length > 0
                            ? MapTags(record)
                            : null
                    }
                />
                <hr />
                <TextField source="transport" />
                <UrlField
                    style={{ fontSize: '14px' }}
                    label="Manifest Address"
                    source="manifest_href"
                />
                {controllerProps.record && QueryVersion() >= 'v1.2' && (
                    <ItemArrayField source="interface_bindings" />
                )}
                {controllerProps.record && QueryVersion() >= 'v1.2' && (
                    <BooleanField
                        label="Subscription Active"
                        source="subscription.active"
                    />
                )}
                <hr />
                <ReferenceField
                    label="Flow"
                    source="flow_id"
                    reference="flows"
                    linkType="show"
                >
                    <ChipConditionalLabel source="label" />
                </ReferenceField>
                <ReferenceField
                    label="Device"
                    source="device_id"
                    reference="devices"
                    linkType="show"
                >
                    <ChipConditionalLabel source="label" />
                </ReferenceField>
                {controllerProps.record &&
                    QueryVersion() >= 'v1.2' &&
                    controllerProps.record.subscription.receiver_id && (
                        <ReferenceField
                            label="Receiver"
                            source="subscription.receiver_id"
                            reference="receivers"
                            linkType="show"
                        >
                            <ChipConditionalLabel source="label" />
                        </ReferenceField>
                    )}
                )}
            </SimpleShowLayout>
        </ShowView>
    );
};

const ShowActiveTab = ({ controllerProps, ...props }) => {
    return (
        <ShowView
            {...props}
            {...controllerProps}
            title={<SendersTitle />}
            actions={<ConnectionShowActions />}
        >
            <SimpleShowLayout>
                <TextField label="ID" source="id" />
                <TextField label="Receiver ID" source="$active.receiver_id" />
                <BooleanField
                    label="Master Enable"
                    source="$active.master_enable"
                />
                <TextField label="Mode" source="$active.activation.mode" />
                <TAIField
                    label="Requested Time"
                    source="$active.activation.requested_time"
                />
                <TAIField
                    label="Activation Time"
                    source="$active.activation.activation_time"
                />
                <TextField label="Transport Type" source="$transporttype" />
                <ArrayField
                    label="Transport Parameters"
                    source="$active.transport_params"
                >
                    <SenderTransportParamsCardsGrid
                        record={controllerProps.record}
                    />
                </ArrayField>
                <JSONViewer endpoint="$active" />
            </SimpleShowLayout>
        </ShowView>
    );
};

const ShowStagedTab = ({ controllerProps, ...props }) => {
    return (
        <ShowView
            {...props}
            {...controllerProps}
            title={<SendersTitle />}
            actions={<ConnectionShowActions />}
        >
            <SimpleShowLayout>
                <TextField label="ID" source="id" />
                <TextField label="Receiver ID" source="staged.receiver_id" />
                <BooleanField
                    label="Master Enable"
                    source="$staged.master_enable"
                />
                <TextField label="Mode" source="$staged.activation.mode" />
                <TAIField
                    label="Requested Time"
                    source="$staged.activation.requested_time"
                />
                <TAIField
                    label="Activation Time"
                    source="$staged.activation.activation_time"
                />
                <TextField label="Transport Type" source="$transporttype" />
                <ArrayField
                    label="Transport Parameters"
                    source="$staged.transport_params"
                >
                    <SenderTransportParamsCardsGrid
                        record={controllerProps.record}
                    />
                </ArrayField>
                <JSONViewer endpoint="$staged" />
            </SimpleShowLayout>
        </ShowView>
    );
};

const ShowTransportFileTab = ({ record }) => {
    const [open, setOpen] = React.useState(false);
    const handleClick = () => {
        copy(get(record, `$transportfile`)).then(() => {
            setOpen(true);
        });
    };
    const handleClose = () => {
        setOpen(false);
    };
    return (
        <ShowView
            record={record}
            title={<SendersTitle />}
            actions={<ConnectionShowActions />}
        >
            <SimpleShowLayout>
                <pre style={{ fontFamily: 'inherit' }}>
                    <Typography>{get(record, '$transportfile')}</Typography>
                </pre>
                <MaterialButton
                    variant="contained"
                    color="primary"
                    onClick={handleClick}
                >
                    Copy
                </MaterialButton>
                <Snackbar
                    open={open}
                    onClose={handleClose}
                    autoHideDuration={3000}
                    message={<span>Transport File Copied</span>}
                />
            </SimpleShowLayout>
        </ShowView>
    );
};

const PostEditToolbar = props => (
    <Toolbar {...props}>
        <SaveButton />
    </Toolbar>
);

export const SendersEdit = props => {
    return (
        <div>
            <AppBar position="static" color="default">
                <Tabs
                    value={props.location.pathname}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab
                        label="Summary"
                        component={Link}
                        to={`${props.basePath}/${props.id}/show/`}
                    />
                    <Tab
                        label="Active"
                        component={Link}
                        to={`${props.basePath}/${props.id}/show/active`}
                    />
                    <Tab
                        label="Staged"
                        value={`${props.match.url}`}
                        component={Link}
                        to={`${props.basePath}/${props.id}/show/staged`}
                    />
                </Tabs>
            </AppBar>
            <Route
                exact
                path={`${props.basePath}/${props.id}/`}
                render={() => <EditStagedTab {...props} />}
            />
        </div>
    );
};

const EditStagedTab = ({ record, ...props }) => {
    return (
        <Edit
            {...props}
            undoable={false}
            title={<SendersTitle />}
            actions={<ConnectionEditActions id={props.id} />}
        >
            <SimpleForm toolbar={<PostEditToolbar />}>
                <TextInput label="Receiver ID" source="$staged.receiver_id" />
                <BooleanInput
                    label="Master Enable"
                    source="$staged.master_enable"
                />
                <SelectInput
                    label="Activation Mode"
                    source="$staged.activation.mode"
                    choices={[
                        { id: null, name: 'None' },
                        {
                            id: 'activate_immediate',
                            name: 'Activate Immediate',
                        },
                        {
                            id: 'activate_scheduled_relative',
                            name: 'Activate Scheduled Relative',
                        },
                        {
                            id: 'activate_scheduled_absolute',
                            name: 'Activate Scheduled Absolute',
                        },
                    ]}
                />
                <FormDataConsumer>
                    {({ formData, ...rest }) => {
                        switch (get(formData, '$staged.activation.mode')) {
                            case 'activate_scheduled_relative':
                                return (
                                    <TextInput
                                        label="Requested Time"
                                        source="$staged.activation.requested_time"
                                        {...rest}
                                    />
                                );
                            case 'activate_scheduled_absolute':
                                return (
                                    <TextInput
                                        label="Requested Time"
                                        source="$staged.activation.requested_time"
                                        {...rest}
                                    />
                                );
                            default:
                                set(
                                    formData,
                                    '$staged.activation.requested_time',
                                    null
                                );
                                return null;
                        }
                    }}
                </FormDataConsumer>
                <SenderTransportParamsCardsGrid />
            </SimpleForm>
        </Edit>
    );
};
