import * as React from 'react'
import uniqid from 'uniqid'
import axios from 'axios'

const { useState } = React

const App = () => {
  const [list, setList] = useState([])
  const [errMsg, setErrMsg] = useState('')
  const [query, setQuery] = useState('')

  const fetchData = async () => {
    try {
      const res = await axios.post('http://localhost:3002/query', {
        headers: { 'Content-Type': 'application/json' },
        params: {
          query
        }
      })
      setErrMsg('')
      setList(res.data)
    } catch (e) {
      setErrMsg(e.response.data.errorMeesages)
    }
  }

  return (
    <div className="App">
      {errMsg && <p>{errMsg}</p>}
      <textarea
        style={{ width: '100%', height: '10rem', fontSize: '16px' }}
        value={query}
        onChange={e => {
          setQuery(e.target.value)
        }}
      ></textarea>
      <div style={{ textAlign: 'right' }}>
        <button
          button="submit"
          onClick={() => {
            if (!query) return
            fetchData()
          }}
        >
          Submit
        </button>
      </div>
      <table style={{ fontSize: '12px' }}>
        <thead>
          <tr>
            {list.length > 0 &&
              Object.keys(list[0]).map(tableKey => (
                <th key={tableKey}>{tableKey}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {list.length > 0 &&
            list.map(item => (
              <tr key={uniqid()}>
                {Object.keys(item).map(tableKey => (
                  <td key={uniqid()}>{item[tableKey]}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
