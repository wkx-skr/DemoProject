export const translate = data => {
  const testNum2 = /^[0-9]*([1-9]*)/
  const dataTest = /^(\d{4})-(\d{2})-(\d{2})$/
  const testChar1 = /^a[0-9]*..$/
  const testChar2 = /^n[0-9]*..$/
  const testChar3 = /^an[0-9]*..$/
  const testChar4 = /^anc[0-9]*..$/
  const testChar5 = /^a[0-9]*..[0-9]*$/
  const testChar6 = /^n[0-9]*..[0-9]*$/
  const testChar7 = /^an[0-9]*..[0-9]*$/
  const testChar8 = /^anc[0-9]*..[0-9]*$/
  if (data.includes('anc..')) {
    if (data.includes('anc..4294967295')) {
      return 'CLOB'
    } else {
      return `VARCHAR2(${data.replace(/[^0-9]/gi, '')})`
    }
  } else if (
    testChar1.test(data) ||
    testChar2.test(data) ||
    testChar3.test(data) ||
    testChar4.test(data)
  ) {
    return `CHAR(${data.replace(/[^0-9]/gi, '')})`
  } else if (
    testChar5.test(data) ||
    testChar6.test(data) ||
    testChar7.test(data) ||
    testChar8.test(data)
  ) {
    const index1 = data.indexOf('..') + 2
    return `VARCHAR2(${data.slice(index1, data.length)})`
  } else if (data === 'YYYY-MM-DD') {
    return 'DATE'
  } else if (data.includes('an..')) {
    return `VARCHAR2(${data.replace(/[^0-9]/gi, '')})`
  } else if (data === 'YYYY-MM-DDTHH:MM:SS' || data === 'HH:MM:SS') {
    return 'TIMESTAMP'
  } else if (data.includes('n..')) {
    if (data.includes('n..4294967295')) {
      return 'BLOB'
    } else {
      return `VARCHAR2(${data.replace(/[^0-9]/gi, '')})`
    }
  } else if (data.includes('a..')) {
    return `VARCHAR2(${data.replace(/[^0-9]/gi, '')})`
  } else if (data.includes('!n')) {
    return `CHAR(${data.replace(/[^0-9]/gi, '')})`
  } else if (data.includes('!a')) {
    if (data.includes('!an')) {
      return `CHAR(${data.replace(/[^0-9]/gi, '')})`
    } else {
      return `CHAR(${data.replace(/[^0-9]/gi, '')})`
    }
  } else if (dataTest.test(data)) {
    return 'DATE'
  } else if (data === '10(0)') {
    return 'INTEGER'
  } else if (testNum2.test(data)) {
    const index = data.indexOf('(')
    if (data.slice(index + 1, data.length - 1) === '0') {
      return 'INTEGER'
    } else {
      return `NUMBER(${parseInt(data)},${data.slice(
        index + 1,
        data.length - 1
      )})`
    }
  } else if (data.includes('!n')) {
    return `CHAR(${data.replace(/[^0-9]/gi, '')})`
  }
}
