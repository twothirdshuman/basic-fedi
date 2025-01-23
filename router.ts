type ResponseFunc = ((request: Request) => Response) | ((request: Request) => Promise<Response>);
interface Endpoint {
    route: string,
    method: "GET" | "POST"
};

export class Router {
    routes: Map<Endpoint, ResponseFunc>;

    constructor() {
        this.routes = new Map();
    }

    get(route: string, responseFunc: ResponseFunc) {
        this.routes.set({
            route: route,
            method: "GET"
        }, responseFunc);
    }
    post(route: string, responseFunc: ResponseFunc) {
        this.routes.set({
            route: route,
            method: "POST"
        }, responseFunc);
    }

    serve(req: Request): undefined | Response | Promise<Response> {
        const method = req.method.toUpperCase();
        const url = new URL(req.url);
        
        let responseFunc: undefined | ResponseFunc = undefined;
        for (const [endpoint, func] of this.routes.entries()) {
            if (endpoint.method !== method) {
                continue;
            }
            if (endpoint.route !== url.pathname) {
                continue;
            }
            responseFunc = func;
        }

        if (responseFunc === undefined) {
            return undefined;
        }

        return responseFunc(req);
    }
}