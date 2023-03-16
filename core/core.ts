import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { filterSchema, setStaticPaths } from './helpers';
import chalk from 'chalk';
import { getComments } from './comment';

interface ServerOptions {
    json?: bodyParser.OptionsJson;
    cors?: cors.CorsOptions
}

interface RunOptions {
    port: number | string
    dev: boolean
    versioning: boolean;
    version: string,

}

const app = express();


export class Server {

    public app = app;

    public express = express;

    private controllers: string[] = [];

    private document: any = [];

    private name = ""

    constructor(name: string, props?: ServerOptions) {

        this.name = name;

        /**
         * 
         * Initialization
         */
        if (props) {

            this.app.use(express.json(props.json));

            this.app.use(cors(props.cors));
            
        }

        this.app.use(morgan('combined'));




        /**
         * 
         * Allowing ejs engine for documentation routes
         */
        this.app.set('views', path.join(__dirname, './views'));

        this.app.set('view engine', 'ejs' as any);

        this.app.use('/static', express.static(path.join(__dirname, 'static')))

        /**
         * 
         * Setting up espress static folder and documentation
         */
        this.app.use('/static', express.static(path.join(__dirname, 'static')));

        setStaticPaths(this.app);

    }


    public register(controller) {

        this.controllers.push(controller.name);

        const comments: any = {};

        const doc: any = {};

        getComments(controller.name, comments);

        doc.name = controller.name;

        doc.desc = comments.desc;

        doc.routers = [];

        for (let key of Object.getOwnPropertyNames(controller.prototype)) {

            if (key !== "constructor") {

                const route = Reflect.getMetadata('route', controller.prototype, key);

                const method = Reflect.getMetadata('method', controller.prototype, key);

                const schema = Reflect.getMetadata('schema', controller.prototype, key);

                const classMethod = comments.methods.filter(t => t.FunctionName === key)[0];

                const routeObj: any = {

                    name: classMethod.name,


                    function: classMethod.FunctionName,

                    responses: classMethod.response,

                    example: '',

                    desc: classMethod.desc,

                    method: method,

                    path: route,

                    auth: classMethod.auth ?? false
                };


                if (schema) {

                    const filteredSchema = filterSchema(schema);

                    routeObj.bodyType = schema.type,

                        routeObj.schema = filteredSchema;
                }

                doc.routers.push(routeObj);
            }

        }

        this.document.push(doc);

    }



    public run(options: RunOptions) {

        const port = options.port || 5000;

        let apiPath = '/api'

        if (options.versioning && options.version) {

            apiPath = apiPath + '/' + options.version

        }

        // this.app.use(apiPath, router); 

        /**
        * 
        * Documentation API
        */
        this.app.get(apiPath + '/docs', (req, res) => {

            if (this.document.length > 0) {

                const firstModule = this.document[0];

                res.redirect(apiPath + `/docs/${firstModule.name.toLowerCase()}`)

            } else {

                res.status(455).send('No modules added, try add some')
            }

        })

        this.app.get(apiPath + '/docs/:module', (req, res) => {

            const moduleName = req.params.module;

            const _module = this.document.filter(t => t.name.toLowerCase() === moduleName)[0];

            res.render('index', { modules: this.controllers, data: _module, name: this.name })

        })

        this.app.get('*', (req, res) => {

            const root = path.join(process.cwd(), 'static');

            res.status(404).sendFile('404.html', { root })

        });


        this.app.listen(port, () => {

            console.log(chalk.bold` Express server is running on`, chalk.blueBright`http://localhost:` + port);

            if (options.dev) {

                console.log(chalk.bold` Api documentations are available at`, chalk.blueBright`http://localhost:${port}${apiPath}/docs`);

            }

        })


    }
}