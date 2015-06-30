import * as _ from 'lodash';
import {Inject, Service} from "interstellar-core";
import {NoSession} from '../errors';

@Service('StellarApi')
@Inject("$http", "interstellar-sessions.Sessions", "interstellar-core.Config")
export default class StellarApi {
  constructor($http, sessions, Config) {
    this.$http     = $http;
    this.sessions  = sessions;
    this.apiServer = Config.get('modules.interstellar-stellar-api.server');
  }

  extendWithAuthData(data = {}) {
    if (!this.sessions.hasDefault()) {
      throw new NoSession();
    }

    let username = this.sessions.default.username;
    let sessionData = this.sessions.default.getData();
    let updateToken = sessionData.updateToken;
    return _.extend(data, {username, updateToken});
  }

  userShow() {
    let data = this.extendWithAuthData();
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
