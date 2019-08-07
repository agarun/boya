'use strict';

var fruits = [];

let vegetables = { broccoli: true };

const protein = 'Dairy';

function bigName(name) {
  console.log({ name });
}

const biggerName = biggerName => {
  let bigObject = {
    name: biggerName,
    nickname: biggerName.slice(0, 5),
    favoriteFruit: 'melon',
    favoriteSweet: 'dried pineapples'
  };
  console.log(bigObject);
  return null;
};

class Person {
  static calculateLove(person1, person2) {
    const lovePct =
      ((person1.firstName.length + person2.firstName.length) % 10) / 10;
    if (lovePct <= 0.5) {
      throw new Error('Unlucky...');
    }
    return lovePct;
  }

  constructor(firstName) {
    this.firstName = firstName;
  }
}

async function getUsers() {
  const result = await API.getUsers();
  return result.statusCode !== 200 && 'cry';
}

for (let index = 0; index < array.length; index++) {
  const element = array[index];
  console.log({ element });
}

switch (action) {
  case RECEIVE_ENTITY:
    break;
  case RECEIVE_ENTITIES:
    break;
  default:
    break;
}

String.prototype.isCoolString = function() {
  return this.toLowerCase().startsWith('a');
};

localStorage.setItem(
  'greeting',
  `I am a ${adjective} fan of string literal${
    ary.length > 1 ? 's' : ''
  } because they are ${anotherAdjective}.`
);
