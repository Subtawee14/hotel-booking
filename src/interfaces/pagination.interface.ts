export interface Page {
  page: number;
  limit: number;
}

export interface Pagination {
  next: Page;
  prev: Page;
  current: Page;
}
