import {Expose} from "class-transformer";

export class Scope {
    @Expose()
    editorIds: string[] = [];
    @Expose()
    viewerIds: string[] = [];
}