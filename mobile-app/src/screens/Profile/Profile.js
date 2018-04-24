import React, { Component } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import PropTypes from 'prop-types';

import toString from 'lodash/toString';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';

import { EVENT_DETAILS_SCREEN, SETTINGS_SCREEN } from '../index';
import strings from '../../config/strings';
import { Icons, Backgrounds } from '../../assets/images';
import { Avatar, Button, Divider, Event, Icon, Tabs, Trashpoint } from '../../components';

import styles from './styles';

import { navigatorStyle } from './config';

class Profile extends Component {

  static navigatorStyle = navigatorStyle;

  previousError = undefined;

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(
            this.onNavigatorEvent.bind(this),
        );

    this.state = {
      visible: true,
      isEndEventsReached: false,
      isEndTrashpointReached: false,
      selectedTab: 'events',
    };
  }

  componentDidMount() {
    const {
        isAuthenticated,
        isGuestSession,
        onFetchProfile,
        onLoadMyEvents,
        onLoadMyTrashPoints,
    } = this.props;

    if (!isAuthenticated && isGuestSession) {
      this.props.navigator.setButtons({
        rightButtons: [],
        leftButtons: [
          {
            icon: Icons.Notification,
            id: 'notification',
          },
        ],
      });

      return;
    }

    onFetchProfile();
    onLoadMyEvents(15, 1);
    onLoadMyTrashPoints(15, 1);

    this.props.navigator.setButtons({
      rightButtons: [
        {
          icon: Icons.Settings,
          id: 'settings',
        },
      ],
      leftButtons: [
        {
          icon: Icons.Notification,
          id: 'notification',
        },
      ],
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.myEvents, this.props.myEvents)) {
      this.setState({ isEndEventsReached: false });
      this.eventsPageNumber += 1;
    }

    if (!isEqual(nextProps.myTrashPoints, this.props.myTrashPoints)) {
      this.setState({ isEndTrashpointReached: false });
    }
  }

  componentDidUpdate() {
    const { error, onSetError } = this.props;
    if (!isNil(error) && !isNil(error.message)) {
      this.showAlert(error.message);
      onSetError(null);
    }
    this.previousError = error;
  }

  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.setState({
        visible: true,
      });
    }
    if (event.id === 'willDisappear') {
      this.setState({
        visible: false,
      });
    }

    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'settings') {
        this.props.navigator.push({
          screen: SETTINGS_SCREEN,
          title: strings.label_settings_header,
        });
      }
    }
  }

  showAlert(error) {
    Alert.alert(
      'Error',
      error,
      [
        { text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
      ],
    );
  }

  handleRenderLocation() {
    const { country } = this.props;

    if (country && country.name) {
      return (
        <View style={styles.locationContainer}>
          <Icon path={Icons.Location} />
          <Text style={styles.locationText}>{country.name}</Text>
        </View>
      );
    }
  }

  handleRenderPhoneNumber() {
    const { profile } = this.props;

    if (profile && profile.phoneNumber) {
      return (
        <View>
          <View style={styles.additionalInfoContainer}>
            <Icon path={Icons.Phone} />
            <Text style={styles.additionalInfoText}>{profile.phoneNumber}</Text>
          </View>
          <Divider />
        </View>
      );
    }
  }

  handleRenderEmail() {
    const { profile } = this.props;

    if (profile && profile.email) {
      return (
        <View>
          <View style={styles.additionalInfoContainer}>
            <Icon path={Icons.Email} />
            <Text style={styles.additionalInfoText}>{profile.email}</Text>
          </View>
          <Divider />
        </View>
      );
    }
  }

  handleEventPress = (event, imageIndex) => {
    this.props.navigator.showModal({
      screen: EVENT_DETAILS_SCREEN,
      title: strings.label_event,
      passProps: {
        eventId: event.id,
        imageIndex,
      },
    });
  };

  handleTrashpointPress = () => {
    console.log('handleTrashpointPress');
  };

  handleEventPagination = () => {
    const { eventsPageSize, myEvents, onLoadMyEvents } = this.props;
    let { eventsPageNumber } = this.props;
    eventsPageNumber++
    if (isEmpty(myEvents)) return;

    if (!this.state.isEndEventsReached && !(myEvents.length % eventsPageSize)) {
      onLoadMyEvents(eventsPageSize, eventsPageNumber);
    }
  };

  handleTrashpointsPagination = () => {
    const { trashpointsPageSize, myTrashPoints, onLoadMyTrashPoints } = this.props;
    let { trashpointsPageNumber } = this.props;

    if (isEmpty(myTrashPoints)) return;

    if (!this.state.isEndTrashpointReached && !(myTrashPoints.length % trashpointsPageSize)) {
      onLoadMyTrashPoints(trashpointsPageSize, ++trashpointsPageNumber);
      this.setState({ isEndTrashpointReached: true });
    }
  };

  selectImage = (imageIndex) => {
    switch (imageIndex) {
      case 0: return Backgrounds.firstEmptyEvent;
      case 1: return Backgrounds.secondEmptyEvent;
      case 2: return Backgrounds.thirdEmptyEvent;
    }
  }

  handleRenderEvents(event) {
    const imageIndex = this.props.myEmptyEvents.indexOf(event) !== -1
      ? this.props.myEmptyEvents.indexOf(event) % 3
      : null;
    const coverPhoto = imageIndex !== null
      ? this.selectImage(imageIndex)
      : { uri: event.photos[0] };
    return (
      <Event
        key={event.id}
        img={coverPhoto}
        title={event.name}
        coordinator={event.coordinator}
        address={event.address}
        date={event.startTime}
        maxParticipants={event.maxPeopleAmount}
        participants={event.peopleAmount}
        onPress={() => this.handleEventPress(event, imageIndex)}
      />
    );
  }

  handleRenderTrashpoint(trashpoint) {
    return (
      <View style={styles.trashpointContainer}>
        <Trashpoint
          type={trashpoint.type}
          location={trashpoint.address}
          onPress={this.handleTrashpointPress}
        />
      </View>
    );
  }

  handleKeyExtractor = event => toString(event.id);
 
  isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
  
  onRenderEvents = () => {
    return (
      <FlatList
        style={styles.tabContent}
        data={this.props.myEvents}
        renderItem={({ item }) => this.handleRenderEvents(item)}
        keyExtractor={this.handleKeyExtractor}
        onEndReachedThreshold={0.5}
        onEndReached={this.handleEventPagination}
      />
    );
  };


  onRenderTrashPoints = () => {
    const { myTrashPoints } = this.props;
    return (
      <FlatList
        style={styles.tabContent}
        data={myTrashPoints}
        renderItem={({ item }) => this.handleRenderTrashpoint(item)}
        keyExtractor={this.handleKeyExtractor}
        onEndReachedThreshold={0.5}
        extraData={this.state}
        onEndReached={this.handleTrashpointsPagination}
      />
    );
  };


  handleRenderGuestProfile = () => {
    return (
      <View style={styles.guestContainer}>
        <View style={styles.imgPlaceholder} />
        <Button
          onPress={this.props.onGuestLogIn}
          text="Log In"
        />
      </View>
    );
  };

  render() {
    const { isAuthenticated, isGuestSession, profile } = this.props;

    const tabs = [
      { content: this.onRenderEvents, name: strings.label_events },
      { content: this.onRenderTrashPoints, name: strings.label_trashpoints },
    ];

    if (!isAuthenticated && isGuestSession) return this.handleRenderGuestProfile();
    return (
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <View style={styles.avatarContainer}>
            <Avatar path={profile && profile.pictureURL} />
            <View style={styles.userNameContainer}>
              <Text style={styles.userNameText}>{profile && profile.name}</Text>
              {this.handleRenderLocation()}
            </View>
          </View>
        </View>
        <Divider />
        {this.handleRenderEmail()}
        <Tabs tabs={tabs} />
      </View>
    );
  }
}

Profile.propTypes = {
  country: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  isGuestSession: PropTypes.bool,
  eventsPageNumber: PropTypes.number,
  eventsPageSize: PropTypes.number,
  trashpointsPageSize: PropTypes.number,
  trashpointsPageNumber: PropTypes.number,
  myEmptyEvents: PropTypes.object,
  profile: PropTypes.object,
  navigator: PropTypes.object,
  myEvents: PropTypes.object,
  error: PropTypes.object,
  myTrashPoints: PropTypes.object,
  onFetchProfile: PropTypes.func,
  onGuestLogIn: PropTypes.func,
  onLoadMyEvents: PropTypes.func,
  onLoadMyTrashPoints: PropTypes.func,
  onSetError: PropTypes.object,
};

export default Profile;
