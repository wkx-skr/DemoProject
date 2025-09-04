interface TableLine {
  source: string;
  target: string;
  label: string;
}
interface Line {
  source: string;
  sourceStepId: string;
  target: string;
  targetStepId: string;
  label: string;
}

interface Entity {
  id: string;
  name: string;
}

interface Column extends Entity {
  order: number | undefined | null;
}

interface StepProperties {
  $input_table: string | undefined | null;
  $output_table: string | undefined | null;
  $user_custom: string | boolean | undefined | null;
}

interface Step extends Entity {
  schema: string | undefined | null,
  properties: any,
  columns: Array<Column>,
  byUser?: boolean,
  height?: number,
  width?: number,
  x?: number,
  y?: number,
}
export {
  TableLine,
  Line,
  Column,
  Step,
}
