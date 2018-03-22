import {Logger} from "./logger";
import {Server,Request,Response,createServer, plugins} from "restify";
import * as Q from "q";
import * as bodyParser from "body-parser";

export interface RestMessage {
    methodName : string;
    message : any;
}

export interface RestResponse{
    status: number;
    data: any
};

interface RestOptions {
    subject : string;
    port: number;
}

export class RESTCommunicationListener {
    /*********** Data Members ****/
    private _logger: Logger;
    private _options : RestOptions;
    private _server: Server;

    constructor(port: number, subject?: string) {
        const funcName = "c'tor";
        this._logger = new Logger("RESTCommunicationListener");

        // verify valid server address
        port = port || 0;
        if (port <= 0 || port >= 65535) {
            throw new Error("Port should be in range of 1-65535");
        }
        this._options = {
            port: port,
            subject: subject || "/"
        };
        this._options.subject = this._options.subject.replace(new RegExp("/$"),"");
        this._options.subject = this._options.subject + "/:methodName";

        this._logger.info(funcName,": Initilized with the following settings",this._options);
    }

    /*********** Events ****/
    public onRequest: (msg: RestMessage,req: Request) => Q.Promise<any>;
        
    public start(): Q.Promise<void> {
        var funcName = "start";
        this._logger.info(funcName, ":Started with the following options=", this._options);
        if (this._server) {
            this._logger.warn(funcName, ": The server was already initialized, ignoring the current request");
            return Q.reject(new Error("Server was already initilzied call disconnect"));
        }

        let waitForStartDefered: Q.Deferred<void> = Q.defer();

        this._server = createServer();
        this._server.listen(this._options.port, () => {
            const funcName = "_onListening";
            this._logger.info(" Started for port=",this._options.port)
            waitForStartDefered.resolve();
        });

        // adds the body parser middleware
        this._server.use(plugins.bodyParser());
        
        // Listens on the subject URL.
        this._server.get(this._options.subject,(req,res,next) => this._onRequest(req,res,next));
        this._server.post(this._options.subject,(req,res,next) => this._onRequest(req,res,next));
        return waitForStartDefered.promise;
    }

    public disconnect() {
        this._logger.info("disconnect: Called");
        this._server.close();
        delete this._server;
    }

    private _onRequest(request:Request,response:Response,next: () => any): any{
        const funcName = "_onRequest";
        this._logger.trace(funcName," Started for " , request.href() , " and with body ",request.body);
        

        //Goingt to notify the new message event
        this._logger.trace(funcName,": Got request from ", request.href(), " with body:",request.body);
        //currently we treat all the messages as requests that needs to be with response.
        if(!this.onRequest){
            this._logger.warn(funcName,": Do not have any message handler");
            return next();
        }

        let message : RestMessage = {
            message: request.body,
            methodName: request.params.methodName
        }

        this.onRequest(message,request)
            .then((resMsg) => {
                this._logger.trace(funcName,": Going to return ", resMsg);
                response.json(resMsg.status,resMsg.data);
            });

        return next();
    }
}