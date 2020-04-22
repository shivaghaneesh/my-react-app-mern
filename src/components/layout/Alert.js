import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

export const Alert = ({ alerts }) =>
  alerts &&
  alerts.length > 0 &&
  alerts.map((a) => (
    <div key={a.id} className={`alert alert-${a.alertType}`}>
      {a.msg}
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  alerts: state.alert,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Alert);
