import React from 'react';
import {Image, Text, TouchableWithoutFeedback, View} from 'react-native';
import PropTypes from 'prop-types';

import moment from 'moment';

import isNil from 'lodash/isNil';

import {Icon} from '../Icon';

import {Icons} from '../../assets/images';

import styles from './styles';

const HorizontalEvent = ({
                             img,
                             title,
                             coordinator,
                             location,
                             date,
                             maxParticipants,
                             participants,
                             onPress,
                             containerStyle,
                         }) => {
    const photo = img ? {uri: img} : Icons.PlaceHolderPhoto;
    const handleRenderParticipants = () => {
        if (!isNil(maxParticipants) && !isNil(participants)) {
            return (
                <View style={styles.participantsContainer}>
                    <Text>{participants}/{maxParticipants}</Text>
                </View>
            );
        }
    };

    const handleRenderCountry = () => {
        if (location) {
            return (
                <View style={styles.locationContainer}>
                    <Icon path={Icons.Location} containerStyle={styles.icon}/>
                    <Text style={styles.locationText}>
                        {location}
                    </Text>
                </View>
            );
        }
    };

    const TouchableWrapper = onPress ? TouchableWithoutFeedback : View;

    return (
        <TouchableWrapper onPress={onPress} style={styles.container}>
            <View style={styles.container}>
                <Image source={photo} style={styles.image}/>
                <View style={styles.middleColumn}>
                    <Text style={styles.title}>{title}</Text>
                    <View>
                        {coordinator &&
                        <View style={styles.coordinatorContainer}>
                            <Icon path={Icons.GroupPeople} containerStyle={styles.icon}/>
                            <Text style={styles.coordinatorText}>{coordinator}</Text>
                        </View>
                        }
                        {handleRenderCountry()}
                    </View>
                </View>
                <View style={styles.rightColumn}>
                    {handleRenderParticipants()}
                    <Text style={styles.dateText}>
                        {moment(date).format('DD.MM.YYYY')}
                    </Text>
                </View>
            </View>
        </TouchableWrapper>
    );
};

HorizontalEvent.propTypes = {
    img: PropTypes.number,
    title: PropTypes.string,
    coordinator: PropTypes.string,
    location: PropTypes.string,
    date: PropTypes.string,
    maxParticipants: PropTypes.number,
    participants: PropTypes.number,
    onPress: PropTypes.func,
};

export {HorizontalEvent};
