import admin from "firebase-admin";
import { google } from "googleapis";
import serviceAccount from "../../serviceAccountKey.json" with { type: "json" };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
});

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

const getAccessToken = () => {
    return new Promise(function (resolve, reject) {
        const jwtClient = new google.auth.JWT(
            serviceAccount.client_email,
            null,
            serviceAccount.private_key,
            SCOPES,
            null
        );
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
};

const sendPushNotification = async (deviceTokens, notificationTitle, notificationBody, imageUrl = null) => {
    console.log(deviceTokens);
    const token = await getAccessToken()
    console.log(token,"access")
    const message = {
        tokens: deviceTokens,
        notification: {
            title: notificationTitle,
            body: notificationBody,
        },
        android: {
            priority: 'high',
        }, 
        apns: {
    headers: {
        'apns-priority': '10'  
    },
    payload: {
        aps: {
            alert: {  
                title: notificationTitle,
                body: notificationBody
            },
            sound: "default",  
            badge: 1, 
            contentAvailable: true 
        }
    }
},
        webpush: {
            headers: {
                Urgency: 'high'
            }
        }
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(response);
        if (response.failureCount > 0) {
            const failedTokens = [];
            const errors = [];
            response.responses.forEach((res, idx) => {
                if (!res.success) {
                    failedTokens.push(deviceTokens[idx]);
                    errors.push({
                        token: deviceTokens[idx],
                        error: res.error?.message || 'Unknown error',
                        status: res.error?.status || 'Unknown status',
                    });
                }
            });
            console.log(`Some notifications failed for tokens: ${failedTokens}`);
            console.log('Detailed errors:', errors);
        } else {
            console.log('All notifications sent successfully!');
        }

        return { status: 200, success: true, msg: 'Notification sent successfully', data: response };
    } catch (error) {
        // Log and return detailed error
        console.error('Error sending multicast message:', error.message || error);
        return { status: 500, success: false, msg: 'Failed to send notification', error: error.message || error };
    }
};

export { getAccessToken, sendPushNotification };;