import { GoogleSignin } from 'react-native-google-signin';

import Api from '../services/Api';
import constants from '../shared/constants';

const FBSDK = require('react-native-fbsdk');

const {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} = FBSDK;

function getAuthHeader(authToken) {
  return {
    ...constants.BASE_HEADER,
    Authorization: `Bearer ${authToken}`,
  };
}

function googleLogin() {
  return GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    iosClientId:
      '750766631573-gub35t5jrnlng5pr2u81rgtitljbbn85.apps.googleusercontent.com',
    webClientId:
      '750766631573-3ucld7s069juiur8hstqia93rpu92c9q.apps.googleusercontent.com',
    offlineAccess: false,
  })
    .then(() => {
      return GoogleSignin.signIn();
    })
    .catch((error) => {
        console.log("Google error", error);
      throw error;
    });
}

function facebookLogin() {
  return LoginManager.logInWithReadPermissions(['public_profile'])
        .then((result) => {
          if (result.isCancelled) {
            throw 'Login cancelled';
          } else {
            return AccessToken.getCurrentAccessToken()
              .then((data) => {
                return new Promise((resolve, reject) => {
                  new GraphRequestManager().addRequest(new GraphRequest(
                    '/me?fields=email',
                      null,
                      (err, res) => {
                        if (err) {
                          reject(err);
                        }

                        const email = res.email && res.email;

                        const updatedData = {
                          token: data,
                          email,
                        };

                        resolve(updatedData);
                      },
                  )).start();
                });
              });
          }
        })
        .catch(error => error);
}

async function logout() {
  try {
    await Api.delete('/auth', { skipError: true });
  } catch (ex) {
    throw ex;
  }
}

async function agreeToTerms() {
  // try {
  //   const response = await Api.put(
  //     '/me/accept-terms',
  //     {},
  //     { withToken: true },
  //     {
  //       'Content-Type': 'application/json',
  //     },
  //   );
  //   return response.data;
  // } catch (ex) {
  //   throw ex;
  // }
}

export default {
  getAuthHeader,
  googleLogin,
  facebookLogin,
  logout,
  agreeToTerms,
};
