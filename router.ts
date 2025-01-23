type ResponseFunc = ((request: Request) => Response) | ((request: Request) => Promise<Response>);
type Route = string;
interface Endpoint {
    route: Route,
    method: "GET" | "POST"
};

function isMatch(route: Route, url: URL): boolean {
    const partsRoute = route.split("/");
    const partsUrl = url.pathname.split("/");

    if (partsRoute.length !== partsUrl.length) {
        return false;
    }
    
    for (let i = 0; i < partsRoute.length; i++) {
        if (partsRoute[i] === "*") {
            continue
        }
        if (partsRoute[i] !== partsUrl[i]) {
            return false;
        }
    }

    return true;
}

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
            if (!isMatch(endpoint.route, url)) {
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