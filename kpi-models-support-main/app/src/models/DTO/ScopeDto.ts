import {Expose} from "class-transformer";

export class ScopeDto {
    @Expose()
    editorIds?: string[] = [];
    @Expose()
    viewerIds?: string[] = [];
}