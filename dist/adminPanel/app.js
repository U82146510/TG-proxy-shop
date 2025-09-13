"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAdminPanel = void 0;
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const loginRoute_1 = require("./routes/loginRoute");
const updatePasswordRoute_1 = require("./routes/updatePasswordRoute");
const productRoute_1 = require("./routes/productRoute");
const userRoute_1 = require("./routes/userRoute");
const monthIncomeRoute_1 = require("./routes/monthIncomeRoute");
const method_override_1 = __importDefault(require("method-override"));
const logoutRoute_1 = require("./routes/logoutRoute");
const sendMessageRoute_1 = require("./routes/sendMessageRoute");
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const connect_db = process.env.atlas;
if (!connect_db) {
    throw new Error('missing atlas connection in the app.ts');
}
const secretKey = process.env.encryptionKey;
if (!secretKey) {
    throw new Error('missing secret key ');
}
const app = (0, express_1.default)();
const port = 3000;
const options = {
    key: fs_1.default.readFileSync(path_1.default.join(__dirname, '../../key.pem')),
    cert: fs_1.default.readFileSync(path_1.default.join(__dirname, '../../cert.pem'))
};
app.use((0, helmet_1.default)({
    hsts: false
}));
app.disable('x-powered-by');
app.disable('etag');
app.use(express_1.default.urlencoded({ extended: false }));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, try again later.'
});
app.use(limiter);
app.use((0, express_session_1.default)({
    name: 'admin.sid',
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
        mongoUrl: connect_db,
        ttl: 60 * 60
    }),
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60
    }
}));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../', "public")));
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '../../', 'views'));
app.use((0, method_override_1.default)('_method'));
app.use('/auth', loginRoute_1.loginRouter);
app.use('/admin', updatePasswordRoute_1.updateRouter);
app.use('/admin', productRoute_1.productRouter);
app.use('/admin', userRoute_1.userRouter);
app.use('/admin', monthIncomeRoute_1.incomeStatistic);
app.use('/admin', logoutRoute_1.logoutRoute);
app.use('/admin', sendMessageRoute_1.sendMsgRoute);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server.' });
});
app.use((req, res, next) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});
const startAdminPanel = async () => {
    try {
        https_1.default.createServer(options, app).listen(3000, () => {
            console.log("Admin Panel running with HTTPS on port 3000");
        });
    }
    catch (error) {
        console.error(error);
    }
};
exports.startAdminPanel = startAdminPanel;
