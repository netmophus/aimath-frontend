import {
  IconAdjustmentsHorizontal,
  IconBook2,
  IconBookmark,
  IconBulb,
  IconCertificate,
  IconFiles,
  IconListCheck,
  IconMathFunction,
  IconPencil,
  IconTools,
  IconVideo,
  type TablerIcon,
} from "@tabler/icons-react";
import CerclesEleves from "./CerclesEleves";

interface EtapeParcours {
  titre: string;
  description: string;
  icon: TablerIcon;
}

/**
 * Les 11 étapes d'une leçon Fahimta, dans l'ordre du parcours. Réparties en
 * deux colonnes (6 à gauche, 5 à droite) dans le rendu ci-dessous.
 */
const ETAPES_PARCOURS: readonly EtapeParcours[] = [
  {
    titre: "Pourquoi cette notion",
    description:
      "Le contexte, l'histoire, et pourquoi c'est important d'apprendre cette notion.",
    icon: IconBulb,
  },
  {
    titre: "Outils pédagogiques",
    description: "Tout ce qu'il faut pour bien démarrer la leçon.",
    icon: IconTools,
  },
  {
    titre: "Prérequis",
    description: "Ce qu'il faut maîtriser avant de commencer.",
    icon: IconListCheck,
  },
  {
    titre: "Cours rédigé",
    description: "La leçon complète, claire et structurée.",
    icon: IconBook2,
  },
  {
    titre: "Démonstrations",
    description: "Les raisonnements détaillés, étape par étape.",
    icon: IconMathFunction,
  },
  {
    titre: "À retenir",
    description: "La synthèse des points clés à mémoriser.",
    icon: IconBookmark,
  },
  {
    titre: "Vidéos",
    description: "Des vidéos pour le cours et pour les exercices.",
    icon: IconVideo,
  },
  {
    titre: "Exercices corrigés",
    description: "S'entraîner avec des corrections complètes.",
    icon: IconPencil,
  },
  {
    titre: "Sujets d'examen types",
    description: "Se préparer avec des sujets corrigés.",
    icon: IconCertificate,
  },
  {
    titre: "Ressources documentaires",
    description: "Pour approfondir et aller plus loin.",
    icon: IconFiles,
  },
  {
    titre: "Simulations interactives",
    description: "Manipuler pour comprendre en profondeur.",
    icon: IconAdjustmentsHorizontal,
  },
];

const COLONNE_GAUCHE = ETAPES_PARCOURS.slice(0, 6);
const COLONNE_DROITE = ETAPES_PARCOURS.slice(6);

function ColonneParcours({
  etapes,
  numeroDepart,
}: {
  etapes: readonly EtapeParcours[];
  numeroDepart: number;
}) {
  return (
    <ol start={numeroDepart} className="flex flex-col">
      {etapes.map((etape, index) => {
        const Icon = etape.icon;
        const estDerniere = index === etapes.length - 1;

        return (
          <li key={etape.titre} className="relative pb-10 last:pb-0">
            {!estDerniere && (
              <span
                aria-hidden="true"
                className="absolute left-5 top-10 h-[calc(100%-1.5rem)] w-0.5 -translate-x-1/2 bg-fh-sable"
              />
            )}
            <div className="relative flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fh-bleu">
                <Icon size={20} stroke={1.75} color="white" aria-hidden="true" />
              </span>
              <div className="pt-1.5">
                <h3 className="font-semibold text-fh-bleu">{etape.titre}</h3>
                <p className="mt-1 text-sm text-fh-ardoise">{etape.description}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function Features() {
  return (
    <section className="bg-fh-creme">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-fh-bleu sm:text-3xl">
            Le parcours d&apos;une leçon Fahimta
          </h2>
          <p className="mt-2 text-sm text-fh-ardoise sm:text-base">
            Du contexte à l&apos;examen, un cheminement pensé pour l&apos;élève
          </p>
        </div>

        <div className="mx-auto max-w-[960px] rounded-2xl border border-fh-sable bg-white p-6 shadow-sm sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
            <ColonneParcours etapes={COLONNE_GAUCHE} numeroDepart={1} />
            <ColonneParcours etapes={COLONNE_DROITE} numeroDepart={7} />
          </div>

          <div className="mt-14 flex flex-col items-center gap-4 sm:mt-16">
            <CerclesEleves />
            <p className="text-center text-sm font-medium text-fh-bleu sm:text-base">
              Rejoins les élèves qui progressent avec Fahimta.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
