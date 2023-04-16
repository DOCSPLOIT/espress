import chalk from 'chalk';
import { readFileSync } from 'fs';
import path from 'path';
import ts from 'typescript';

export const getComments = (directory, container) => {
  const fileBuffer = readFileSync(path.join(process.cwd(), '.espressive')).toString('utf-8');

  const espressConfig = JSON.parse(fileBuffer);

  const rootPath = espressConfig.module.root;

  if (rootPath) {
    const file = path.join(process.cwd(), rootPath, directory, `${directory}.controller.${espressConfig.environment==="development"?"ts":"d.ts"}`);

    const program = ts.createProgram([file], {
      module: ts.ModuleKind.CommonJS,

      experimentalDecorators: true,

      noResolve: true,

      target: ts.ScriptTarget.Latest,
    });

    const source = program.getSourceFile(file);
    if (source) {
      for (let statement of source.statements) {
        if (ts.isClassDeclaration(statement)) {
          let doc = (statement as any).jsDoc;

          if (doc) {
            doc = doc[0];

            doc.tags?.map((t) => {
              if (t.tagName.escapedText === 'name') {
                container.name = t.comment?.toString();
              }

              if (t.tagName.escapedText === 'desc') {
                container.desc = t.comment?.toString();
              }
            });
          }

          container.methods = [];

          statement.members.map((member: any) => {
            const method: any = {};

            method.FunctionName = (member.name as any)?.escapedText;

            if (member.jsDoc) {
              const _doc = member.jsDoc[0];

              if (_doc) {
                _doc.tags?.map((q) => {
                  if (q.tagName.escapedText === 'name') {
                    method.name = q.comment?.toString();
                  }

                  if (q.tagName.escapedText === 'desc') {
                    method.desc = q.comment?.toString();
                  }

                  if (q.tagName.escapedText === 'response') {
                    let cmt = q.comment?.toString();

                    cmt = cmt?.split(',');

                    method.response = cmt.map((ite) => {
                      ite = ite.split('=');

                      return { code: ite[0], message: ite[1] };
                    });
                  }

                  if (q.tagName.escapedText === 'auth') {
                    method.auth = q.comment?.toString();
                  }
                });
              }
            } else {
              console.log(
                chalk.yellow` You haven't provided comments on "${directory}" member "${method.FunctionName}" skipping`,
              );
            }

            container.methods?.push(method);
          });
        }
      }
    } else {
      // throw Error('Error while creating documentation:: create issue in the repo please!')
    }
  } else {
    throw Error('module configuration is missing:: please check .espressive file');
  }
};
