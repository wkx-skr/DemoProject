import client from 'webpack-theme-color-replacer/client'
import colorMap from './theme/colorMap'
export function changeColor (back = false) {
  let options = {
    newColors: [...(back ? Object.keys(colorMap) : Object.values(colorMap))] // new colors array, one-to-one corresponde with `matchColors`
  }
  client.changer.changeColor(options, Promise).then(() => {
    console.log('Theme colors changed!')
    localStorage.setItem('editorTheme', back ? 'white' : 'black')
  })
}
