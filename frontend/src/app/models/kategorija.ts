export class Podkategorija {
  naziv = '';
}

export class Kategorija {
  _id = '';
  naziv = '';
  podkategorije: Podkategorija[] = [];
}
