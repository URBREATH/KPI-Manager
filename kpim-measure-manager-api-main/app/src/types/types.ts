type EnvVar = {
    name: string;
    value: string;
};

type Task = {
    taskId: string,
    taskScope: string
}

type Operation = "UPDATE" | "DELETE" | "READ";

