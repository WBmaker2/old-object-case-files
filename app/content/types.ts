export type CaseId = "handaxe" | "figurine-lid" | "celadon-die";
export type EvidenceStatus = "observed" | "documented" | "inferred" | "unknown";
export type RevisionAction = "keep" | "refine" | "replace" | "defer";
export type HypothesisSupport =
  | "best-supported"
  | "plausible-limited"
  | "conflicts-with-clue"
  | "responsible-defer";

export interface AssetAttribution {
  id: string;
  localPath: string;
  imageSource: "museum-original" | "ai-generated-learning-reconstruction";
  originalFileName: string;
  institution: string;
  artifactTitle: string;
  collectionNumber: string;
  licenseType: "KOGL-1";
  licenseUrl: string;
  requiredCredit: string;
  recordUrl: string;
  imageUrl: string;
  checkedAt: string;
  originalSha256: string;
  derivativeSha256: string;
  derivativeOperations: readonly string[];
}

export interface EvidenceClue {
  id: string;
  stage: 1 | 2 | 3;
  status: EvidenceStatus;
  title: string;
  text: string;
  sourceUrl: string;
}

export interface HypothesisOption {
  id: string;
  text: string;
  supportByStage: Readonly<Record<1 | 2 | 3, HypothesisSupport>>;
  scopeLimit: string;
}

export interface CaseFile {
  id: CaseId;
  caseTitle: string;
  question: string;
  artifact: {
    title: string;
    collectionNumber: string;
    institution: string;
    period: string;
    material: string;
    dimensions: string;
    findspot: string;
    recordUrl: string;
  };
  assetId: string;
  imageAlt: string;
  observations: readonly { id: string; text: string }[];
  clues: readonly EvidenceClue[];
  hypotheses: readonly HypothesisOption[];
  unknownText: string;
  curriculumCode: string;
}

export interface HypothesisVersion {
  caseId: CaseId;
  version: 1 | 2 | 3;
  hypothesisId: string;
  statement: string;
  action: RevisionAction;
  evidenceIds: readonly string[];
  revealedClueIds: readonly string[];
}
