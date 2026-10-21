export type credentials = {
  username: string;
  accessKey?: string;
};

export type UniqueKey = {
  [key: string]: any[];
};

export type MessageCompletedTask = {
  taskId: string;
  data: number[];
};

export type previewObject = {
  columnName: string;
  values: number[];
};

export type MongoDbDataSourceResult = {
  [key: string]: number[];
};

export type CredentialsSource = 'body' | 'vault';

export type ConnectionInfo = {
  uri?: string;
  protocol?: 'http' | 'https' | 'postgres';
};
