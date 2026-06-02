import 'reflect-metadata';
import { validate } from 'class-validator';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  grade?: string[];

  @IsString()
  pdfUrl: string;

  @IsString()
  audioUrl: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;
}

const payload = {
  title: "Test",
  author: "Author",
  description: "",
  category: "Cat",
  grade: ["1", "2"],
  audioUrl: "",
  pdfUrl: "",
  coverImage: "",
  duration: 0
};

const instance = plainToInstance(CreateBookDto, payload);
validate(instance, { whitelist: true }).then(errors => {
  console.log(JSON.stringify(errors, null, 2));
});
