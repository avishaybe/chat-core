import * as log4js from "log4js";

export class Logger{
    private _logger: log4js.Logger;

    public static initLogging() : void{
        let config: log4js.Configuration = {
            appenders: {
                "console": {
                    type: 'console'
                }
            },
            categories: { 
                default: { 
                    appenders: ['console'], 
                    level: 'trace' 
                } 
            }
        };
        log4js.configure(config);
    }

    constructor(categgory: string){
        this._logger = log4js.getLogger(categgory);
    }

    public trace(message: string, ...args: any[]): void{
        this._logger.trace(message, ...args);
    }

	public debug(message: string, ...args: any[]): void{
        this._logger.debug(message, ...args);
    }

	public info(message: string, ...args: any[]): void{
        this._logger.info(message, ...args);
    }

	warn(message: string, ...args: any[]): void{
        this._logger.warn(message,...args);
    }

	error(message: string, ...args: any[]): void{
        this._logger.error(message,...args);
    }

    fatal(message: string, ...args: any[]): void{
        this._logger.fatal(message,...args);
    }
}