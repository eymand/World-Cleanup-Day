import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import querystring from 'query-string';
import _ from 'lodash';

import { actions, selectors } from '../../reducers/trashpile';
import { EditTrashpoint } from '../../components/EditTrashpoint';
import { Details } from '../../components/TrashpointDetails';
import { actions as appActions } from '../../reducers/app';
import { selectors as userSelectors } from '../../reducers/user';
import { USER_ROLES } from '../../shared/constants';

class TrashDetails extends React.Component {

  static propTypes = {
    setActiveTab: PropTypes.func.isRequired,
    fetchMarkerDetails: PropTypes.func.isRequired,
    focusMapLocation: PropTypes.func.isRequired,
    toggleDetailsWindow: PropTypes.func.isRequired,
    isUserAllowedAdding: PropTypes.bool.isRequired,
    trashpointId: PropTypes.string,
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string,
      }),
    }).isRequired,
    isOpened: PropTypes.bool.isRequired,
    marker: PropTypes.shape({
      id: PropTypes.string,
    }),
    location: PropTypes.shape({
      state: PropTypes.shape({
        selectedArea: PropTypes.shape,
      }),
    }).isRequired,
    authUser: PropTypes.shape({
      role: PropTypes.string,
    }),
    history: PropTypes.shape({
      location: PropTypes.shape({
        search: PropTypes.string,
      }),
      push: PropTypes.func,
    }).isRequired,
  }

  static defaultProps = {
    trashpointId: '',
    authUser: null,
    marker: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      edit: false,
    };
  }

  componentWillMount() {
    this.props.setActiveTab('trashpoints');
  }

  componentDidMount() {
    const { trashpointId, history } = this.props;
    if (trashpointId) {
      this.fetchMarkerDetails({
        id: trashpointId,
        focusMap: !!querystring.parse(history.location.search).focus,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.trashpointId &&
      this.props.trashpointId !== nextProps.trashpointId
    ) {
      this.fetchMarkerDetails({
        id: nextProps.trashpointId,
        focusMap: !!querystring.parse(nextProps.history.location.search).focus,
      });
    }
  }
  fetchMarkerDetails = ({ id, focusMap = false }) => {
    this.props.fetchMarkerDetails(id).then(marker => {
      if (!marker) {
        return;
      }
      if (focusMap) {
        this.props.focusMapLocation(marker.location);
      }
    });
  };
  handleOnCloseDetailsClick = () => {
    const url = '/trashpoints';
    this.props.history.push(url, {
      selectedArea: this.props.authUser.role !== USER_ROLES.VOLUNTEER ?
        (this.props.location.state ?
          this.props.location.state.selectedArea :
          undefined) :
        undefined,
    });
  };

  handleOnCloseEditClick = () => {
    this.setState({ edit: false });
  };

  handleEditTrashpoint = () => {
    this.setState({ edit: true });
  };
  handleEditSuccess = () => {
    this.setState({
      edit: false,
    });
    this.props.fetchMarkerDetails(this.props.match.params.id);
  };
  actions = {
    onCloseDetailsClick: this.handleOnCloseDetailsClick,
    onCloseEditClick: this.handleOnCloseEditClick,
    onEditTrashpointClick: this.handleEditTrashpoint,
    onTrashpointEditSuccess: this.handleEditSuccess,
  };
  canUserEditTrashPoint = () => {
    const { authUser, marker } = this.props;
    if (!authUser) {
      return false;
    }
    if (!marker || !marker.id) {
      return false;
    }
    if (authUser.role === 'superadmin') {
      return true;
    }
    if (!Array.isArray(authUser.areas)) {
      return false;
    }
    if (authUser.areas.length === 0) {
      return false;
    }
    if (!Array.isArray(marker.areas)) {
      return false;
    }
    return _.intersection(authUser.areas, marker.areas).length > 0;
  };

  render() {
    const { history } = this.props;
    if (this.state.edit) {
      return (
        <EditTrashpoint
          history={history}
          marker={this.props.marker}
          actions={this.actions}
        />
      );
    }
    return (
      <Details
        marker={this.props.marker}
        isOpened={this.props.isOpened}
        toggleDetailsWindow={this.props.toggleDetailsWindow}
        trashpointId={this.props.trashpointId}
        isUserAllowedAdding={this.props.isUserAllowedAdding}
        history={this.props.history}
        actions={this.actions}
        canEdit={this.canUserEditTrashPoint()}
      />
    );
  }
}

const mapState = state => ({
  marker: selectors.getMarkerDetails(state),
  authUser: userSelectors.getProfile(state),
  isOpened: selectors.getShowDetailsWindow(state),
});
const mapDispatch = {
  fetchMarkerDetails: actions.fetchMarkerDetails,
  focusMapLocation: actions.focusMapLocation,
  setActiveTab: appActions.setActiveTab,
  toggleDetailsWindow: actions.toggleDetailsWindow,
};

export default connect(mapState, mapDispatch)(TrashDetails);
