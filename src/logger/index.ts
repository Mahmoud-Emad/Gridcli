import chalk from "chalk";
import Table from 'cli-table3';
import * as process from 'process';
import { ITableData } from '../types';

class GridCliLogger{
  static info(message: string){
    console.log(
      chalk.blue(message)
    )
  }

  static error(message: string){
    console.log(
      chalk.red(message)
    )
  }

  static success(message: string){
    console.log(
      chalk.green(message)
    )
  }

  static logTable(data: ITableData, colWidths?: number[]) {
    const table = new Table({
      head: data.headers,
      colWidths: !colWidths ? data.headers.map(() => Math.floor(process.stdout.columns / data.headers.length - 5)) : colWidths,
      wordWrap: true,
    });
  
    const values = data.values.length ? data.values : data.headers.map(() => "-");
    table.push(values);
    GridCliLogger.info(table.toString())
  }
  
}

export {
  GridCliLogger,
}