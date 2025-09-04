interface TableLine {
  source: string;
  target: string;
}
interface Line {
  source: string;
  sourceStepId: string;
  target: string;
  targetStepId: string;
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
  $cursor: string | undefined | null;
  $cursor_var: string | undefined | null;
  $json_step: string | undefined | null;
}

interface Step extends Entity {
  schema: string | undefined | null,
  properties: StepProperties,
  columns: Array<Column>,
  byUser?: boolean
}
export {
  TableLine,
  Line,
  Column,
  Step,
}
