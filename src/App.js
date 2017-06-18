import React, { Component } from 'react'
import hljs from 'highlight.js'
import {Markup, Editor, Container, Column, Row, RuleInput, RuleLabel, StyleInput, Button, Document} from './styled'
import {rando} from './utils'

console.log(rando.randomInt(1,5))


class App extends Component {

  state = {
    editor: '',
    rules: 1,
    name0: '',
    begin0: '',
    end0: '',
    style0: '',
  }


  newField = () => {
    this.setState( (prevState) => {
      let {rules} = prevState
      let fields = ['name', 'begin', 'end', 'style']
      let inputValues = {}
      fields.forEach( (field) => {
        inputValues = {
          ...inputValues,
          [`${field}${rules}`]: ''
        }
      })
      rules++
      return {
        rules,
        ...inputValues
      }
    })
  }

  handleChange = (event) => {
    let {name, value} = event.target
    this.setState({
      [name]: value
    })
  }

  tab = (e) => {
    if (e.keyCode === 9) {
      let {value, selectionStart, selectionEnd} = e.target
      e.preventDefault()
      e.target.value = value.substring(0, selectionStart)
                            .concat('\t')
                            .concat(value.substring(selectionEnd))

      e.target.selectionStart = e.target.selectionEnd = selectionStart + 1
      this.handleChange(e)
    }
  }

  convertToMarkup = (text) => {
    return {
      __html: hljs.highlightAuto(text).value
    }
  }

  language = (newRules) => {
    return () => ({
      contains: [
        ...newRules
      ]
    })
  }

  registerLanguage = (state) => {
    let {rules} = state
    let ruleObjects = []
    for (let i = 0; i < rules; i++) {
      let newRule = {
        className: state[`name${i}`],
        begin: state[`begin${i}`],
        end: state[`end${i}`]
      }
      let {className, begin, end} = newRule
      if (
        className.length > 1 &&
        begin.length > 1 &&
        end.length > 1
      ) {
        begin = new RegExp(begin)
        end = new RegExp(end)
        ruleObjects.push(newRule)
      }
    }
    hljs.registerLanguage('language' , this.language(ruleObjects))
    hljs.configure({
      languages: ['language'],
    })
  }



  componentWillUpdate(nextProps, nextState) {
    this.registerLanguage(nextState)
  }

  prepareStyles = () => {
    let {rules} = this.state
    let styles = []
    for (let i = 0; i < rules; i ++) {
      styles.push(`
        .hljs-${this.state['name'+i]} {
          ${this.state['style'+i]}
        }
      `)
    }

    let newStyles = "".concat(styles)

    return newStyles
  }

  rules = () => {
    let {rules} = this.state
    let array = []
    let fields = ['name', 'begin', 'end']
    for (let i = 0; i < rules; i++) {
      array.push(
        <Row
          key={i}
        >
          <Column>
            {fields.map( (field, index) => {
              return (
                <Column
                  key={`${field}${index}`}
                >
                  <RuleLabel>
                    {field}
                  </RuleLabel>
                  <RuleInput
                    value={this.state[`${field}${i}`]}
                    onChange={this.handleChange}
                    name={`${field}${i}`}
                  />
                </Column>
              )
            })}
          </Column>
          <StyleInput
            value={this.state[`style${i}`]}
            onChange={this.handleChange}
            name={`style${i}`}
          />
        </Row>
      )
    }


    return array
  }

  render() {
    let {rules, newField, handleChange, tab, convertToMarkup, prepareStyles} = this
    let {editor} = this.state
    return (
      <Container>
        <Column>
          {rules()}
          <Button
            onClick={newField}
          >
            New Rule
          </Button>
        </Column>
        <Column>
          <Button>
            Random Text
          </Button>
          <Document>
            <Editor
              name={"editor"}
              value={editor}
              onChange={handleChange}
              onKeyDown={tab}
              ref={"editor"}
            />
            <Markup
              dangerouslySetInnerHTML={convertToMarkup(editor)}
              customStyles={prepareStyles()}
            />
          </Document>
        </Column>
      </Container>
    )
  }
}

export default App
