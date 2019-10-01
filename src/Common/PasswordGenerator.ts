export namespace PasswordGenerator {
  export function newPassword() {
    return [
      random(subjects),
      random(adjectives),
      random(actions),
      random(letters) + randomNumber(0, 9) + randomNumber(0, 9),
    ].join("-");
  }

  function random(itemList: string[]) {
    const index = randomNumber(0, itemList.length - 1);

    return itemList[index];
  }

  function randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const subjects = [
    ...["treapta", "casa", "soare", "luna", "cer", "stea", "corb", "proces", "nivel", "progres"],
    ...["somn", "pas", "carte", "poarta", "produs", "margine", "adevar", "curent", "vulcan", "inceput"],
    ...["potential", "calitate", "caracter", "rezultat", "idee", "constructie", "amintire", "valoare"],
    ...["amic", "angajament", "armonie", "sinergie", "arta", "atentie", "multumire", "implinire", "persoana"],
  ];
  const adjectives = [
    ...["rotund", "inalt", "indelungat", "verde", "copt", "deschis", "amplu", "rapid", "atent", "albastru", "galben"],
    ...["alb", "slab", "rece", "cald", "curajos", "verificabil", "abundent", "agil", "ager", "admirabil", "asezat"],
    ...["amabil", "asertiv", "autentic", "multumit", "implinit", "clar", "simplu", "inteligent", "priceput", "capabil"],
  ];
  const actions = [
    ...["merge", "sare", "zboara", "asculta", "aude", "prinde", "cuprinde", "vede", "descopera", "crede"],
    ...["prevede", "desprinde", "ascunde", "ajunge", "deprinde", "intelege", "invata", "admira", "aduna"],
    ...["alina", "asigura", "cunoaste", "planifica", "indruma", "increde", "persista", "ajuta", "sustine"],
  ];
  const letters = [
    ...["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"],
    ...["q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "n", "o", "p"],
  ];
}
