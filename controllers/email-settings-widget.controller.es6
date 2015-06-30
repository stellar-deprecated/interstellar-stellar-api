import {Inject, Widget} from 'interstellar-core';

require('../styles/secret-key-widget.scss');

@Widget('emailSettings', 'EmailSettingsWidgetController', 'interstellar-stellar-api/email-settings-widget')
@Inject('interstellar-sessions.Sessions', 'interstellar-stellar-api.StellarApi')
export default class EmailSettingsWidgetController {
  constructor(Sessions, StellarApi) {
    this.Sessions = Sessions;
    this.StellarApi = StellarApi;
    this.loaded = false;
    this.StellarApi.userShow()
      .success(response => {
        this.loaded = true;
        if (response.data.email) {
          this.email = response.data.email.address;
          this.emailVerified = response.data.email.verified;
          this.state = 'added';
        } else {
          this.state = 'none';
        }
      })
      .error(() => {
        console.error('Error loading data in interstellar-stellar-api.EmailSettingsWidgetController');
      })
  }

  resetState() {
    if (this.email) {
      this.setState('added');
    } else {
      this.setState('none');
    }
  };

  setState(state) {
    this.state = state;
    this.error = null;
  };

  emailAction() {
    if (this.state === 'change') {
      return this.changeEmail();
    } else if (this.state === 'verify') {
      return this.verifyEmail();
    }
  }

  verifyEmail() {
    return this.StellarApi.userVerifyEmail({token: this.verifyToken})
      .then(() => {
        this.emailVerified = true;
        this.verifyToken = null;
        this.state = 'added';
      })
      .catch(error => {
        this.error = error.data.status === 'fail' ? error.data.message : 'Server error';
      });
  }

  changeEmail() {
    return this.StellarApi.userChangeEmail({email: this.newEmail, subscribe: this.subscribe})
      .then(() => {
        this.email = this.newEmail;
        this.emailVerified = false;
        this.newEmail = null;
        this.state = 'added';
      })
      .catch(error => {
        this.error = error.data.status === 'fail' ? error.data.message : 'Server error';
      });
  }
}
