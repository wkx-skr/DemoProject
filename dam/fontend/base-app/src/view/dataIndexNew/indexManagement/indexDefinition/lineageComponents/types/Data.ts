interface TableLine {
  source: string;
  target: string;
}
interface Line {
  source: string;
  sourceStepId: string;
  target: string;
  targetStepId: string;
  lineageFiles?: string;
}

interface Entity {
  id: string;
  name: string;
}

interface Column extends Entity {
  order: number | undefined | null;
}

interface StepProperties {
  typeId?: string | undefined | null;
  $input_table: string | undefined | null;
  $output_table: string | undefined | null;
  $user_custom: string | boolean | undefined | null;
  $cursor: string | undefined | null;
  $cursor_var: string | undefined | null;
  qualityNum?: number | undefined;
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
