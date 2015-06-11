import * as _ from 'lodash';
import {Inject} from "interstellar-core";
import {NoSession} from '../errors';

@Inject("$http", "interstellar-sessions.Sessions", "interstellar-core.Config")
class StellarApi {
  constructor($http, sessions, Config) {
    this.$http     = $http;
    this.sessions  = sessions;
    this.apiServer = Config.get('modules.interstellar-stellar-api.server');
  }

  extendWithAuthData(data = {}) {
    if (!this.sessions.hasDefault()) {
      throw new NoSession();
    }

    let sessionData = this.sessions.default.getData();
    let username = sessionData.username;
    let updateToken = sessionData.updateToken;
    return _.extend(data, {username, updateToken});
  }

  userShow(data) {
    return this.$http.post(this.apiServer + "/users/show", data);
  }

  userSettings() {
    let data = this.extendWithAuthData();
    return this.$http.get(this.apiServer + "/user/settings", {params: data});
  }

  userSetRecover(data) {
    data = this.extendWithAuthData(data);
    return this.$http.post(this.apiServer + "/user/setrecover", data);
  }

  userSetFederate(data) {
    data = this.extendWithAuthData(data);
    return this.$http.post(this.apiServer + "/user/setfederate", data);
  }

  userSetSubscribe(data) {
    data = this.extendWithAuthData(data);
    return this.$http.post(this.apiServer + "/user/setsubscribe", data);
  }

  userEmail(data) {
    data = this.extendWithAuthData(data);
    return this.$http.post(this.apiServer + "/user/email", data);
  }

  userChangeEmail(data) {
    data = this.extendWithAuthData(data);
    return this.$http.post(this.apiServer + "/user/changeEmail", data);
  }

  userVerifyEmail(data) {
    data = this.extendWithAuthData(data);
    return this.$http.post(this.apiServer + "/user/verifyEmail", data);
  }

  federation(destination, domain) {
    return this.$http.get(this.apiServer + "/federation", {params: {destination, domain}});
  }

  reverseFederation(address, domain) {
    return this.$http.get(this.apiServer + "/reverseFederation", {params: {address, domain}});
  }
}

module.exports = function(mod) {
  mod.service("StellarApi", StellarApi);
};
