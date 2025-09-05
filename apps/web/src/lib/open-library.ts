import { createParams } from "@/utils/create-params"

export interface QueryReturn {
  numFound: number
  start: number
  numFoundExact: boolean
  num_found: number
  documentation_url: string
  q: string
  docs: QueryDoc[]
}

export interface QueryDoc {
  authorKey: string[]
  author_name: string[]
  cover_edition_key: string
  cover_i: number
  ebook_access: string
  edition_count: number
  first_publish_year: number
  has_fulltext: boolean
  key: string
  language: string[]
  publish_scan_b: boolean
  title: string
}

export interface Work {
  description: string,
  title: string,
  covers: string[],
  subjects: string[],
  subject_people: string[],
  key: string,
  authors: WorkAuthor[],
  type: {key: string},
  subtitle: string,
  latest_revision: number,
  revision: number,
  created: {
    type: string,
    value: string,
  },
  last_modified: {
    type: string,
    value: string
  }
}
export interface WorkAuthor {
    author: {key: string},
    type: {key: string}
}
export interface WorkDate {
  type: string,
  value: string
}

const BASE_URL = 'https://openlibrary.org'

export const getBookQuery = async (
  title: string,
  author: string
): Promise<Partial<QueryReturn>> => {
  const params = new URLSearchParams({title: title.toLocaleLowerCase(), author: author.toLocaleLowerCase()})
  const data = await fetch(
    `${BASE_URL}/search.json?q=${params}`
  )
  const response = data.json()
  return response
}

export const getBookContent = async (key: string): Promise<Partial<Work>> => {
  const data = await fetch(`${BASE_URL}${key}.json`)
  const response = data.json();
  return response;
}