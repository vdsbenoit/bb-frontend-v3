let firebaseConfig: any;

if (process.env.NODE_ENV === "production") {
    // prod DB
    firebaseConfig = {
        apiKey: "AIzaSyBPS9sBLuX7ULxwqxVLI9e431w9ggmKiaM",
        authDomain: "badenbattle-a0dec.firebaseapp.com",
        databaseURL: "https://badenbattle-a0dec.firebaseio.com",
        projectId: "badenbattle-a0dec",
        storageBucket: "badenbattle-a0dec.appspot.com",
        messagingSenderId: "855454974300",
        appId: "1:855454974300:web:9904d0ea27239000038199",
        measurementId: "G-9SGHK33E8H",
    }
} else {
    // dev DB
    firebaseConfig = {
        apiKey: "AIzaSyDuMiWI3efv5QDIwM9omswbcW8bmZWhIYI",
        authDomain: "mailmerge-59e91.firebaseapp.com",
        databaseURL: "https://mailmerge-59e91.firebaseio.com",
        projectId: "mailmerge-59e91",
        storageBucket: "mailmerge-59e91.appspot.com",
        messagingSenderId: "557635489513",
        appId: "1:557635489513:web:2ff42b389953ea594faa78"
    };
}
// firebaseConfig = {
//     apiKey: "AIzaSyBPS9sBLuX7ULxwqxVLI9e431w9ggmKiaM",
//     authDomain: "badenbattle-a0dec.firebaseapp.com",
//     databaseURL: "https://badenbattle-a0dec.firebaseio.com",
//     projectId: "badenbattle-a0dec",
//     storageBucket: "badenbattle-a0dec.appspot.com",
//     messagingSenderId: "855454974300",
//     appId: "1:855454974300:web:9904d0ea27239000038199",
//     measurementId: "G-9SGHK33E8H",
// }

export { firebaseConfig };