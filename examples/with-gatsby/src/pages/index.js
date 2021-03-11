import React from "react"
import { Table, Column, HeaderCell, Cell } from "rsuite-table"
import "rsuite-table/dist/css/rsuite-table.css"

const dataList = [
  { id: 1, name: "a", email: "a@email.com", avartar: "..." },
  { id: 2, name: "b", email: "b@email.com", avartar: "..." },
  { id: 3, name: "c", email: "c@email.com", avartar: "..." },
]

export default function Home() {
  const [sortColumn, setSortColumn] = React.useState("id")
  const [sortType, setSortType] = React.useState("asc")
  return (
    <div>
      <Table
        data={dataList}
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={(key, type) => {
          setSortColumn(key)
          setSortType(type)
          console.log(key, type)
        }}
      >
        <Column width={100} sortable fixed resizable>
          <HeaderCell>ID</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column width={100} sortable resizable>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>

        <Column width={100} sortable resizable>
          <HeaderCell>Email</HeaderCell>
          <Cell>
            {(rowData, rowIndex) => {
              return <a href={`mailto:${rowData.email}`}>{rowData.email}</a>
            }}
          </Cell>
        </Column>
      </Table>
    </div>
  )
}
