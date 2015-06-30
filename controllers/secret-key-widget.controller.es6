import {Inject, Widget} from 'interstellar-core';

require('../styles/secret-key-widget.scss');

@Widget('secretKey', 'SecretKeyWidgetController', 'interstellar-stellar-api/secret-key-widget')
@Inject('interstellar-sessions.Sessions')
export default class SecretKeyWidgetController {
  constructor(Sessions) {
    this.Sessions = Sessions;
    this.visible = false;
  }

  show() {
    this.secretKey = this.Sessions.default.secret;
    this.visible = true;
  }

  hide() {
    this.secretKey = null;
    this.visible = false;
  }
}
